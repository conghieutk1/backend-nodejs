const Sequelize = require("sequelize");

// Option 1: Passing parameters separately
// create migration
// npx sequelize-cli db:migrate
const sequelize = new Sequelize("hieudang", "root", null, {
    host: "localhost",
    dialect: "mysql",
    logging: false,
});

let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

module.exports = connectDB;
