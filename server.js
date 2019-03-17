const express = require('express');
const bodyParser = require('body-parser')

const db = require('./config/dbconnection')
const userRouter = require('./routes/api/users')

const app = express()

app.use (bodyParser.urlencoded({
    extended:false
}))

app.use(bodyParser.json())
app.use('/api/users',userRouter)

const port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log('Server listening to port ', port);
})