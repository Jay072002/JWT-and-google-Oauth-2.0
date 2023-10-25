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

// Generate token valid for 1hr for authentication
const generateToken = (payloadWithoutIatAndExp, expirationTime) => {
  try {
    const secretKey = process.env.SECRETKEY;

    const token = jwt.sign(payloadWithoutIatAndExp, secretKey, {
      expiresIn: expirationTime,
    });

    return token;
  } catch (error) {
    console.error("Could Not Generate Tokens", error);
    throw new Error("Could not generate tokens");
  }
};

module.exports = {
  generateToken,
  secondsToHumanReadable,
};
