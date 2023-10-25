const cron = require("node-cron");
const jwt = require("jsonwebtoken");
const Tokendata = require("../models/TokenData");
const {
  generateToken,
  secondsToHumanReadable,
} = require("../utils/helper/jwt");
const {
  REFRESH_TOKEN_CRON_SCHEDULE,
  REFRESH_TOKEN_THRESHOLD_TIME,
  REFRESH_TOKEN_VALIDITY,
  ACCESS_TOKEN_CRON_SCHEDULE,
  ACCESS_TOKEN_VALIDITY,
} = require("../utils/constants.js");

console.log(
  REFRESH_TOKEN_CRON_SCHEDULE,
  REFRESH_TOKEN_THRESHOLD_TIME,
  REFRESH_TOKEN_VALIDITY,
  ACCESS_TOKEN_CRON_SCHEDULE,
  ACCESS_TOKEN_VALIDITY
);

// generate new refresh token just before it gets expires (every 6 days)
cron.schedule(REFRESH_TOKEN_CRON_SCHEDULE, async () => {
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
  if (refreshTokenExp - currentTimestamp < REFRESH_TOKEN_THRESHOLD_TIME) {
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

      const newRefreshToken = generateToken(
        restVerifiedPayload,
        REFRESH_TOKEN_VALIDITY
      );

      const refreshTokenDecoded = jwt.decode(newRefreshToken);

      const refreshTokenValidity = new Date(
        refreshTokenDecoded?.exp * 1000
      ).toLocaleString();

      // Update the database with the new refresh token
      tokenData.refresh_token = newRefreshToken;
      tokenData.refresh_token_validity = refreshTokenValidity;
      await tokenData.save();

      const refreshTokenTimeInSeconds =
        refreshTokenDecoded.exp - refreshTokenDecoded.iat;
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
cron.schedule(ACCESS_TOKEN_CRON_SCHEDULE, async () => {
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

        const newAccessToken = generateToken(
          restVerifiedPayload,
          ACCESS_TOKEN_VALIDITY
        );

        const accessTokenDecoded = jwt.decode(newAccessToken);

        const accessTokenValidity = new Date(
          accessTokenDecoded?.exp * 1000
        ).toLocaleString();

        // Update the database with the new access token
        tokenData.access_token = newAccessToken;
        tokenData.access_token_validity = accessTokenValidity;
        await tokenData.save();

        const accessTokenTimeInSeconds =
          accessTokenDecoded.exp - accessTokenDecoded.iat;
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
