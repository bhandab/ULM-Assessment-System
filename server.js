const express = require('express');
const bodyParser = require('body-parser')
const passport = require('passport');

const db = require('./config/dbconnection')
const userRouter = require('./routes/api/users')
const outcomeRouter = require('./routes/api/outcomes')


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

const port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log('Server listening to port ', port);
})