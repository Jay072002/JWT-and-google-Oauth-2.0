require("dotenv").config();
require("./cron/index");
const express = require("express");
const connect = require("./db/connect");
const seeder = require("./seeder");
const { USERNAME, EMAIL, PASSWORD } = require("./utils/constants.js");

const app = express();

// App middlewares
app.use(express.json());

(async () => {
  try {
    const URL = process.env.MONGO_URI;
    const PORT = process.env.PORT || 5000;

    await connect(URL);
    console.log("MYSQL CONNECTED!!");

    // call the seeder function to generate new access token and refresh token
    await seeder({
      username: USERNAME,
      email: EMAIL,
      password: PASSWORD,
    });

    app.listen(PORT, () => {
      console.log(`SERVER IS UP AND RUNNING ON ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
})();
