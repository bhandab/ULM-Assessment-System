const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const db = require('../../config/dbconnection')
const keys = require('../../config/keys')
const validateOutcomeInput = require('../../validation/learning-outcome') 

var router = express.Router()

// @route POST api/outcomes/createOutcome
// @desc Creates a new learning outcome
// @access Private

router.post('/createOutcome',passport.authenticate('jwt',{session:false}),(req,res)=>{

    let {errors, isValid} = validateOutcomeInput(req.body)
    if(!isValid){
        return res.status(400).json(errors)
    }

    let outcome = db.escape(req.body.outcomeDescription.trim())
    let adminID = db.escape(req.user.id)
    let sql = "SELECT * FROM LEARNING_OUTCOME WHERE learnDesc="+outcome+" AND corId="+adminID
    db.query(sql, (err,result)=>{
        if(err){
            return res.status(500).json(err)
        }

        else if(result.length>0){
            errors.outcomeDescription = "This Learning Outcome Already Exists"
            return res.status(400).json(errors)
        }
        sql = "INSERT INTO LEARNING_OUTCOME (learnDesc, corId) VALUES ("+outcome+","+adminID + ")"
        db.query(sql,(err,result)=>{
            if(err){
                return res.status(500).json(err)
            }
            let outcomeID = result.insertId
            res.status(200).json({outcomeID,outcome})
        })
    })

})

// @route GET api/outcomes/learningOutcomes
// @desc Generates all outcomes created by the coordinator
// @access Private


router.get('/',passport.authenticate('jwt',{session:false}),(req, res)=>{
    let sql = "SELECT * FROM LEARNING_OUTCOME WHERE corId="+db.escape(req.user.id)
    let outcomes = []
    db.query(sql,(err, result)=>{
        if(err){
           return res.status(500).json(err)
        }
        else if(result.length>0){
            result.forEach(row => {
                outcome = {
                    outcomeID:row.learnID,
                    outcomeDescription:row.learnDesc
                }
                outcomes.push(outcome)
            })
            
        }
        res.status(200).json(outcomes)
        
    })
})
module.exports = router

