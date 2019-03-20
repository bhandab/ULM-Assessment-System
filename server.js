const express = require('express');
const bodyParser = require('body-parser')
const passport = require('passport');

const db = require('./config/dbconnection')
const userRouter = require('./routes/api/users')
const outcomeRouter = require('./routes/api/outcomes')
const measureRouter = require('./routes/api/measures')
const cycleRouter = require('./routes/api/assessment-cycles')

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
app.use('/api/cycles',cycleRouter)

const port = process.env.PORT || 5000

app.listen(port,()=>{
    console.log('Server listening to port ', port);
})