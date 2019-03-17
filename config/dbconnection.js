const mysql = require('mysql')
require('dotenv').config()

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password:process.env.DB_PASSWORD
    
})
connection.connect((error)=>{
    if(error){
        return console.log('Error connecting to database! ', error)
    }
    console.log("MySQL connection Successful!")
})

module.exports = connection