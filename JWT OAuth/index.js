require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const jwt = require("jsonwebtoken");
const connect = require("./db/connect");
const { secondsToHumanReadable } = require("./utils/helper/jwt");
const router = require("./routes/index");
const Tokendata = require("./models/TokenData");

const app = express();

// App middlewares
app.use(express.json());

// App routes

app.use("/api/v1", router);

// generate new refresh token just before it gets expires
cron.schedule("0 0 */7 * *", async () => {
  console.log("Refresh token scheduler block");

  // Check the database for access token validity
  const tokenData = await Tokendata.findOne();

  if (!tokenData) {
    console.log("Token data not found in the database.");
    return;
  }

  // Generate new refresh token just before it expires

  const currentTimestamp = Math.floor(Date.now() / 1000); //in seconds
  const refreshTokenExp = Math.floor(
    tokenData.refresh_token_validity.getTime() / 1000 //in seconds
  );

  // Check if the refresh token is close to expiring (less than 7 days)
  if (refreshTokenExp - currentTimestamp < 604800) {
    console.log(
      "Refresh token is about to expire. Generating a new refresh token."
    );

    // Use the existing refresh token and generate a new refresh token
    const secretKey = process.env.SECRETKEY;
    const refreshToken = tokenData?.refresh_token;
    const verifiedPayload = jwt.verify(refreshToken, secretKey);

    if (verifiedPayload) {
      const { iat, exp, ...restVerifiedPayload } = verifiedPayload;

      const newRefreshToken = jwt.sign(restVerifiedPayload, secretKey, {
        expiresIn: "7d", // Set the new refrsh token expiration (e.g., 7 days)
      });

      // Update the database with the new refresh token
      tokenData.refresh_token = newRefreshToken;
      await tokenData.save();

      const newRefreshTokenPayload = jwt.decode(newRefreshToken);
      const refreshTokenTimeInSeconds =
        newRefreshTokenPayload.exp - newRefreshTokenPayload.iat;
      const refreshTokenExpHours = secondsToHumanReadable(
        refreshTokenTimeInSeconds
      );

      console.log({
        refreshToken: newRefreshToken,
        refreshTokenExp: refreshTokenExpHours,
      });
    }
  }
});

// generate new access token after it gets expires
cron.schedule("*/30 * * * *", async () => {
  try {
    console.log("Access token scheduler block");

    // Check the database for access token validity
    const tokenData = await Tokendata.findOne();

    if (!tokenData) {
      console.log("Token data not found in the database.");
      return;
    }

    const accessTokenValidityInMS = new Date(
      tokenData?.access_token_validity
    ).getTime();

    const currentTimeInMS = new Date(Date.now()).getTime();

    if (currentTimeInMS > accessTokenValidityInMS) {
      console.log(
        "Access token is about to expire. Generating a new refresh token."
      );

      // Use the existing refresh token and generate a new access token
      const secretKey = process.env.SECRETKEY;
      const refreshToken = tokenData?.refresh_token;
      const verifiedPayload = jwt.verify(refreshToken, secretKey);

      if (verifiedPayload) {
        const { iat, exp, ...restVerifiedPayload } = verifiedPayload;

        const newAccessToken = jwt.sign(restVerifiedPayload, secretKey, {
          expiresIn: "30m", // Set the new access token expiration (e.g., 30 minutes)
        });

        // Update the database with the new access token
        tokenData.access_token = newAccessToken;
        await tokenData.save();

        const newAccessTokenPayload = jwt.decode(newAccessToken);
        const accessTokenTimeInSeconds =
          newAccessTokenPayload.exp - newAccessTokenPayload.iat;
        const accessTokenExpHours = secondsToHumanReadable(
          accessTokenTimeInSeconds
        );

        console.log({
          accessToken: newAccessToken,
          accessTokenExp: accessTokenExpHours,
        });
      }
    }
  } catch (error) {
    console.error("Error in the access token scheduler:", error);
  }
});

(async () => {
  try {
    const URL = process.env.MONGO_URI;
    const PORT = process.env.PORT || 5000;

    await connect(URL);

    console.log("MYSQL CONNECTED!!");

    app.listen(PORT, () => {
      console.log(`SERVER IS UP AND RUNNING ON ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
})();
