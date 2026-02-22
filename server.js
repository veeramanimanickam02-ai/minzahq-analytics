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
      `https://openapi.etsy.com/v3/application/shops/${SHOP_ID}/listings/active`,
      {
        headers: {
          "x-api-key": ETSY_API_KEY
        }
      }
    );

    const listings = response.data.results;

    const totalListings = listings.length;

    const totalViews = listings.reduce((sum, item) => {
      return sum + (item.views || 0);
    }, 0);

    const totalFavorites = listings.reduce((sum, item) => {
      return sum + (item.num_favorers || 0);
    }, 0);

    res.json({
      status: "Success",
      totalListings,
      totalViews,
      totalFavorites,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error("Error fetching Etsy data:", error.response?.data || error.message);

    res.json({
      status: "Error",
      lastUpdated: null,
      data: null
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
