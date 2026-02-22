app.get("/analytics", async (req, res) => {
  try {
    const response = await axios.get(
      `https://openapi.etsy.com/v3/application/shops/${SHOP_ID}`,
      {
        headers: {
          "x-api-key": ETSY_API_KEY
        }
      }
    );

    res.json({
      status: "Success",
      shopName: response.data.shop_name,
      shopId: response.data.shop_id,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);

    res.json({
      status: "Error",
      error: error.response?.data || error.message
    });
  }
});
