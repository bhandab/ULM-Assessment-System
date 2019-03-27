const mysql = require("mysql");

let connection = null;
console.log("I am Here");
if (process.env.NODE_ENV === "production") {
  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  console.log("WASSSSSSSSSSUPPPPPPPP", connection);
} else {
  require("dotenv").config();
  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  console.log(connection);
}

connection.connect(error => {
  if (error) {
    return console.log("Error connecting to database! ", error);
  }
  console.log("MySQL connection Successful!");
});

module.exports = connection;
