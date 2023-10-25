const { DataTypes } = require("sequelize");
const connectToDatabase = require("../db/connect");

// Create a Sequelize instance
const sequelize = connectToDatabase();

const Tokendata = sequelize.define("Tokendata", {
  access_token: {
    type: DataTypes.STRING,
  },
  refresh_token: {
    type: DataTypes.STRING,
  },
  access_token_validity: {
    type: DataTypes.STRING, // Corrected data type
  },
  refresh_token_validity: {
    type: DataTypes.STRING, // Corrected data type
  },
});

module.exports = Tokendata;
