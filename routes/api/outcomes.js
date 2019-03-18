const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const db = require('../../config/dbconnection')
const keys = require('../../config/keys')
const validateOutcomeInput = require('../../validation/learning-outcome') 

var router = express.Router()

// @route POST api/outcomes/create
// @desc Creates a new learning outcome
// @access Protected

router.post('/create',passport.authenticate('jwt',{session:false}),(req,res)=>{

    let {errors, isValid} = validateOutcomeInput(req.body)
    if(!isValid){
        return res.status(400).json(errors)
    }

    let outcome = db.escape(req.body.outcomeDescription)
    let sql = "SELECT * FROM LEARNING_OUTCOME WHERE learnDesc="+outcome
    db.query(sql, (err,result)=>{
        if(err){
            return res.status(500).json(err)
        }

        else if(result.length>0){
            errors.outcomeDescription = "This Learning Outcome Already Exists"
            return res.status(400).json(errors)
        }
        sql = "INSERT INTO LEARNING_OUTCOME (learnDesc, corId) VALUES ("+outcome+","+db.escape(req.user.id) + ")"
        db.query(sql,(err,result)=>{
            if(err){
                return res.status(500).json(err)
            }
            let outcomeID = result.insertId
            res.status(200).json({outcomeID,outcome})
        })
    })

})

module.exports = router

