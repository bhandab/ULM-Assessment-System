const mysql = require("mysql");
require("dotenv").config();
let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(error => {
  if (error) {
    return console.log("Error connecting to database! ", error);
  }
  console.log("MySQL connection Successful!", connection);
});

module.exports = connection;
