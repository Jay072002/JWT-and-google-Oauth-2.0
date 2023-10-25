const jwt = require("jsonwebtoken");
const { secondsToHumanReadable } = require("../utils/helper/jwt");
const Tokendata = require("../models/TokenData");

// Generate token valid for 1hr for authentication
const generateTokens = async (req, res) => {
  try {
    const secretKey = process.env.SECRETKEY;

    const payload = req.body;

    const accessTokenExpiration = "30m"; //4 min
    const refreshTokenExpiration = "7d"; //7 days

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

    const accessTokenValidityMinutes = 30; // 30 minutes
    const accessTokenValidTill = new Date(
      Date.now() + accessTokenValidityMinutes * 60 * 1000
    ).toLocaleString();

    const refreshTokenValidityDays = 7; // 7 days
    const refreshTokenValidTill = new Date(
      Date.now() + refreshTokenValidityDays * 24 * 60 * 60 * 1000
    ).toLocaleString();

    // Save token data to the database
    await Tokendata.create({
      access_token: accessToken,
      refresh_token: refreshToken,
      access_token_validity: accessTokenValidTill,
      refresh_token_validity: refreshTokenValidTill,
    });

    res
      .status(200)
      .json({ accessToken, refreshToken, accessTokenExp, refreshTokenExp });
  } catch (error) {
    console.error("Could Not Generate Tokens", error);
    res.status(500).json({ message: "Error While Generating Tokens" });
  }
};

module.exports = { generateTokens };
