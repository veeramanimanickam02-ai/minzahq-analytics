const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;

const ETSY_API_KEY = process.env.ETSY_API_KEY;
const SHOP_ID = process.env.SHOP_ID;

app.get("/", (req, res) => {
  res.send("MinzaHQ Analytics Backend Running 🚀");
});

app.get("/analytics", async (req, res) => {
  try {
    const response = await axios.get(
      `https://openapi.etsy.com/v3/application/listings/active?shop_id=${SHOP_ID}`,
      {
        headers: {
          "x-api-key": ETSY_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const listings = response.data.results || [];

    res.json({
      status: "Success",
      totalListings: listings.length,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error("Error fetching Etsy data:", error.response?.data || error.message);

    res.json({
      status: "Error",
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
