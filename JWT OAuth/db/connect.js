const { Sequelize } = require("sequelize");

function connectToDatabase() {
  const { DBNAME, DBHOST, DBUSERNAME, DBPASSWORD } = process.env;

  const sequelize = new Sequelize(DBNAME, DBUSERNAME, DBPASSWORD, {
    host: DBHOST,
    dialect: "mysql",
  });

  // Optionally, you can perform any database-related configuration here

  sequelize.sync({ alter: true });

  return sequelize;
}

module.exports = connectToDatabase;
