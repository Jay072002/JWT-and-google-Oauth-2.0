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

const daysToLocalDateString = (days) => {
  if (days) {
    const localDateString = new Date(
      Date.now() + parseInt(days) * 24 * 60 * 60 * 1000
    ).toLocaleString();
    return localDateString;
  } else {
    throw new Error("Days required to convert into date string");
  }
};

const minutesToLocalDateString = (minutes) => {
  if (minutes) {
    const localDateString = new Date(
      Date.now() + parseInt(minutes) * 60 * 1000
    ).toLocaleString();

    return localDateString;
  } else {
    throw new Error("Minutes required to convert into date string");
  }
};

module.exports = {
  generateToken,
  secondsToHumanReadable,
  daysToLocalDateString,
  minutesToLocalDateString,
};
