const express = require('express');
const bodyParser = require('body-parser')
const passport = require('passport');
path = require("path")
const db = require('./config/dbconnection')
const userRouter = require('./routes/api/users')
const outcomeRouter = require('./routes/api/outcomes')
const measureRouter = require('./routes/api/measures')

const app = express()

app.use (bodyParser.urlencoded({
    extended:false
}))

app.use(bodyParser.json())


// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

app.use('/api/users',userRouter)
app.use('/api/outcomes',outcomeRouter)
app.use('/api/measures',measureRouter)

app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, "client","public","index.html"))
    res.send("hello from express");
});


const port = process.env.PORT || 5000

app.listen(port,()=>{
    console.log('Server listening to port ', port);
})