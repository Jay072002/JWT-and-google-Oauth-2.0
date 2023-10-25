const { Sequelize } = require("sequelize");

function connectToDatabase() {
  const sequelize = new Sequelize("jwt", "jay", "(Jay)@12345", {
    host: "localhost",
    dialect: "mysql",
  });

  // Optionally, you can perform any database-related configuration here

  sequelize.sync({ alter: true });

  return sequelize;
}

module.exports = connectToDatabase;
