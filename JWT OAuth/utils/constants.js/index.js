const USERNAME = "admin";
const EMAIL = "admin@gmail.com";
const PASSWORD = "admin@123";
const ACCESS_TOKEN_VALIDITY = "90m"; // in minutes
const REFRESH_TOKEN_VALIDITY = "4d"; // in days

const currentMinute = new Date(Date.now()).getMinutes();
const currentHour = new Date(Date.now()).getHours();

const ACCESS_TOKEN_CRON_SCHEDULE = `*/${
  parseInt(ACCESS_TOKEN_VALIDITY) - 2
} * * * *`;

const REFRESH_TOKEN_CRON_SCHEDULE = `${currentMinute} ${
  currentHour - 2
} */${parseInt(REFRESH_TOKEN_VALIDITY)} * *`;

const REFRESH_TOKEN_THRESHOLD_TIME =
  parseInt(REFRESH_TOKEN_VALIDITY) * 24 * 3600 - 3600; // in seconds (minus 1 hours of validity)

module.exports = {
  USERNAME,
  EMAIL,
  PASSWORD,
  ACCESS_TOKEN_VALIDITY,
  REFRESH_TOKEN_VALIDITY,
  ACCESS_TOKEN_CRON_SCHEDULE,
  REFRESH_TOKEN_CRON_SCHEDULE,
  REFRESH_TOKEN_THRESHOLD_TIME,
};
