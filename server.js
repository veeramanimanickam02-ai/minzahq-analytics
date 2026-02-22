const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 8080;

const ETSY_API_KEY = process.env.ETSY_API_KEY;
const ETSY_SHARED_SECRET = process.env.ETSY_SHARED_SECRET;
const SHOP_ID = process.env.SHOP_ID;
const BASE_URL = process.env.BASE_URL;

let accessToken = null;

app.get("/", (req, res) => {
  res.send("MinzaHQ OAuth Backend Running 🚀");
});

/* STEP 1 — Redirect to Etsy */
app.get("/auth", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = `https://www.etsy.com/oauth/connect?response_type=code&redirect_uri=${BASE_URL}/callback&scope=listings_r%20shops_r&client_id=${ETSY_API_KEY}&state=${state}`;

  res.redirect(authUrl);
});

/* STEP 2 — Handle Callback */
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post(
      "https://api.etsy.com/v3/public/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: ETSY_API_KEY,
        redirect_uri: `${BASE_URL}/callback`,
        code: code
      },
      {
        auth: {
          username: ETSY_API_KEY,
          password: ETSY_SHARED_SECRET
        }
      }
    );

    accessToken = response.data.access_token;

    res.send("OAuth Successful ✅ You can now access /analytics");

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.send("OAuth Failed ❌");
  }
});

/* STEP 3 — Use Access Token */
app.get("/analytics", async (req, res) => {
  if (!accessToken) {
    return res.json({
      status: "Error",
      message: "Please authenticate first at /auth"
    });
  }

  try {
    const response = await axios.get(
      `https://openapi.etsy.com/v3/application/shops/${SHOP_ID}/listings/active`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "x-api-key": ETSY_API_KEY
        }
      }
    );

    res.json({
      status: "Success",
      totalListings: response.data.results.length,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error(error.response?.data || error.message);

    res.json({
      status: "Error",
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
