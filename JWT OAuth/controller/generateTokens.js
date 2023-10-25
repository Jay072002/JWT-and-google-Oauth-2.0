const jwt = require("jsonwebtoken");
const {
  secondsToHumanReadable,
  minutesToLocalDateString,
  daysToLocalDateString,
  generateToken,
} = require("../utils/helper/jwt");
const Tokendata = require("../models/TokenData");

// Generate token valid for 1hr for authentication
const generateTokens = async (req, res) => {
  try {
    const secretKey = process.env.SECRETKEY;

    const payload = req.body;

    const accessToken = generateToken(payload, "30m");
    const refreshToken = generateToken(payload, "7d");

    const accessTokenDecoded = jwt.decode(accessToken);
    const refreshTokenDecoded = jwt.decode(refreshToken);

    const accessTokenTimeInSeconds =
      accessTokenDecoded.exp - accessTokenDecoded.iat;
    const refreshTokenTimeInSeconds =
      refreshTokenDecoded.exp - refreshTokenDecoded.iat;

    const accessTokenExp = secondsToHumanReadable(accessTokenTimeInSeconds);
    const refreshTokenExp = secondsToHumanReadable(refreshTokenTimeInSeconds);

    const accessTokenValidTill = minutesToLocalDateString(30);
    const refreshTokenValidTill = daysToLocalDateString(7);

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
