require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const jwt = require("jsonwebtoken");
const connect = require("./db/connect");
const {
  secondsToHumanReadable,
  generateToken,
  daysToLocalDateString,
  minutesToLocalDateString,
} = require("./utils/helper/jwt");
const router = require("./routes/index");
const Tokendata = require("./models/TokenData");

const app = express();

// App middlewares
app.use(express.json());

// App routes
app.use("/api/v1", router);

// generate new refresh token just before it gets expires (every 6 days)
cron.schedule("* * */6 * *", async () => {
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
    new Date(tokenData.refresh_token_validity).getTime() / 1000 //in seconds
  );

  // Check if the refresh token is close to expiring (less than 6 days)
  if (refreshTokenExp - currentTimestamp < 518400) {
    console.log(
      "Refresh token is about to expire. Generating a new refresh token."
    );

    // Use the existing refresh token and generate a new refresh token
    const secretKey = process.env.SECRETKEY;
    const refreshToken = tokenData?.refresh_token;
    const verifiedPayload = jwt.verify(refreshToken, secretKey);

    if (verifiedPayload) {
      // remove the iat and exp to give new expiration time or keep if want the same expiration time as before
      const { iat, exp, ...restVerifiedPayload } = verifiedPayload;

      const newRefreshToken = generateToken(restVerifiedPayload, "7d");

      const refreshTokenValidTill = daysToLocalDateString(7);

      // Update the database with the new refresh token
      tokenData.refresh_token = newRefreshToken;
      tokenData.refresh_token_validity = refreshTokenValidTill;
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
      console.log("Access token is expired. Generating a new access token.");

      // Use the existing refresh token and generate a new access token and update the time
      const secretKey = process.env.SECRETKEY;
      const refreshToken = tokenData?.refresh_token;
      const verifiedPayload = jwt.verify(refreshToken, secretKey);

      if (verifiedPayload) {
        const { iat, exp, ...restVerifiedPayload } = verifiedPayload;

        const newAccessToken = generateToken(restVerifiedPayload, "30m");
        const accessTokenValidTill = minutesToLocalDateString(30);

        // Update the database with the new access token
        tokenData.access_token = newAccessToken;
        tokenData.access_token_validity = accessTokenValidTill;
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
