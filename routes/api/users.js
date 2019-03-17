const  express = require('express')
const bcrpt = require('becrypt')
const jwt = require('jwt')
const db = require('../../config/dbconnection')

const router  = express.Router()
