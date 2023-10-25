const jwt = require("jsonwebtoken");

const secondsToHumanReadable = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor(((seconds % 86400) % 3600) / 60);
  const secondsLeft = seconds % 60;

  let result = "";
  if (days > 0) {
    result += `${days} days, `;
  }
  if (hours > 0) {
    result += `${hours} hours, `;
  }
  if (minutes > 0) {
    result += `${minutes} minutes, `;
  }
  if (secondsLeft > 0) {
    result += `${secondsLeft} seconds`;
  }

  return result;
};

const generateNewRefreshToken = (
  existingRefreshToken,
  newExpiration = "7d"
) => {
  const secretKey = process.env.SECRETKEY;

  try {
    const decoded = jwt.verify(existingRefreshToken, secretKey);

    const expirationThreshold = Date.now() + 60 * 60 * 1000; // 1 hour in milliseconds
    if (decoded.exp <= expirationThreshold) {
      // The existing refresh token is about to expire, so generate a new one
      const newRefreshToken = jwt.sign(decoded, secretKey, {
        expiresIn: newExpiration,
      });
      return newRefreshToken;
    }

    // If the existing refresh token is not close to expiration, return it as is
    return existingRefreshToken;
  } catch (error) {
    console.error("Could Not Generate New Refresh Token", error);
    throw new Error("Could not generate a new refresh token.");
  }
};

// Generate token valid for 1hr for authentication
const generateToken = (payload) => {
  try {
    const secretKey = process.env.SECRETKEY;

    const accessTokenExpiration = "1h";
    const refreshTokenExpiration = "7d";

    const accessToken = jwt.sign(payload, secretKey, {
      expiresIn: accessTokenExpiration,
    });
    const refreshToken = jwt.sign(payload, secretKey, {
      expiresIn: refreshTokenExpiration,
    });

    const accessTokenDecoded = jwt.decode(accessToken);
    const refreshTokenDecoded = jwt.decode(refreshToken);

    const accessTokenTimeInSeconds =
      accessTokenDecoded.exp - accessTokenDecoded.iat;
    const refreshTokenTimeInSeconds =
      refreshTokenDecoded.exp - refreshTokenDecoded.iat;

    const accessTokenExp = secondsToHumanReadable(accessTokenTimeInSeconds);
    const refreshTokenExp = secondsToHumanReadable(refreshTokenTimeInSeconds);

    return {
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
    };
  } catch (error) {
    console.error("Could Not Generate Tokens", error);
    throw new Error("Could not generate tokens");
  }
};

// Generate new access token from the refresh token
const generateAccessTokenFromRefreshToken = (refreshToken) => {
  try {
    const secretKey = process.env.SECRETKEY;

    const verifiedPayload = jwt.verify(refreshToken, secretKey);

    if (verifiedPayload) {
      const newAccessToken = jwt.sign(verifiedPayload, secretKey);
      const accessTokenDecoded = jwt.decode(newAccessToken);
      const accessTokenExpHours = secondsToHumanReadable(
        accessTokenDecoded.exp
      );
      return {
        accessToken: newAccessToken,
        accessTokenExp: accessTokenExpHours,
      };
    }
  } catch (error) {
    console.error("Could Not Generate New Access Token", error);
    throw new Error("Could not generate New Access Token From Refresh Token");
  }
};

module.exports = {
  generateToken,
  generateNewRefreshToken,
  generateAccessTokenFromRefreshToken,
  secondsToHumanReadable,
};
