const cron = require("node-cron");
const express = require("express");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const port = 5000;

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});

let REFRESH_TOKEN = "";

const CLIENT_ID =
  "508155321845-i9fc4itjucm7sfb3b9fsses3a50fb6sv.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:5000/auth/callback";

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ["https://www.googleapis.com/auth/drive"];

app.get("/auth", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const access_token = tokens?.access_token;

    REFRESH_TOKEN = tokens?.refresh_token;

    console.log("Access Token:", access_token);
    console.log("Refresh Token:", REFRESH_TOKEN);

    res.send("Access Token and Refresh Token Obtained");
  } catch (error) {
    console.error("Error getting tokens:", error);
    res.status(500).send("Error getting tokens.");
  }
});

cron.schedule("30 * * * * *", () => {
  refreshAccessToken(REFRESH_TOKEN);
});

async function refreshAccessToken(refreshToken) {
  try {
    const { tokens } = await oauth2Client.refreshToken(refreshToken);
    const newAccessToken = tokens.access_token;
    console.log("New Access Token:", newAccessToken);
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
}
