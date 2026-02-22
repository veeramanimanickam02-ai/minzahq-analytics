const express = require("express");
const axios = require("axios");
const cron = require("node-cron");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const ETSY_API_KEY = process.env.ETSY_API_KEY;
const SHOP_ID = process.env.SHOP_ID;

let analyticsData = {
  status: "Initializing...",
  lastUpdated: null,
  data: null
};

async function fetchEtsyData() {
  try {
    const response = await axios.get(
      `https://openapi.etsy.com/v3/application/shops/${SHOP_ID}/receipts`,
      {
        headers: {
          "x-api-key": ETSY_API_KEY
        }
      }
    );

    analyticsData = {
      status: "Success",
      lastUpdated: new Date(),
      data: response.data
    };

    console.log("Etsy data updated");
  } catch (error) {
    console.error("Error fetching Etsy data:", error.message);

    analyticsData.status = "Error";
  }
}

// Run every 5 minutes
cron.schedule("*/5 * * * *", () => {
  fetchEtsyData();
});

// Run once on server start
fetchEtsyData();

app.get("/analytics", (req, res) => {
  res.json(analyticsData);
});

app.get("/", (req, res) => {
  res.send("MinzaHQ Analytics Backend Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
