const jwt = require("jsonwebtoken");
const { generateToken } = require("./utils/helper/jwt");
const Tokendata = require("./models/TokenData");
const {
  ACCESS_TOKEN_VALIDITY,
  REFRESH_TOKEN_VALIDITY,
} = require("./utils/constants.js");

// Generate token valid for 1hr for authentication
const generateTokens = async (payload) => {
  try {
    const isExist = await Tokendata.findOne();

    if (!isExist) {
      const accessToken = generateToken(payload, ACCESS_TOKEN_VALIDITY);
      const refreshToken = generateToken(payload, REFRESH_TOKEN_VALIDITY);

      const accessTokenDecoded = jwt.decode(accessToken);
      const refreshTokenDecoded = jwt.decode(refreshToken);

      const accessTokenValidity = new Date(
        accessTokenDecoded?.exp * 1000
      ).toLocaleString();

      const refreshTokenValidity = new Date(
        refreshTokenDecoded?.exp * 1000
      ).toLocaleString();

      // Save token data to the database
      await Tokendata.create({
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_validity: accessTokenValidity,
        refresh_token_validity: refreshTokenValidity,
      });

      console.log("STORED ACCESS AND REFRESH TOKEN IN DB");
    }
    console.log("SEEDER FUNCTION EXECUTED SUCCESSFULLY");
  } catch (error) {
    console.error("Could Not Generate Tokens", error);
    throw new Error("Error while executing seeder function");
  }
};

module.exports = generateTokens;
