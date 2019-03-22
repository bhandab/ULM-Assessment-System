const express = require('express')
const passport = require('passport')
const jwt  = require('jsonwebtoken')

const db = require('../../config/dbconnection')
const validateMeasureInput = require('../../validation/performance-measure')

const router = express.Router()

// @route POST api/measures/createMeasure
// @desc Creates a new performance Measure
// @access Private

router.post('/createMeasure',passport.authenticate('jwt',{session:false}),(req, res)=>{
    let {errors,isValid} = validateMeasureInput(req.body)
    if(!isValid){
        return res.status(400).json(errors)
    }

    let measure = db.escape(req.body.measureDescription)
    let adminID = db.escape(req.user.id)//req.user is where payload from login is stored by jwt strategy

    let sql = "SELECT * FROM PERFORMANCE_MEASURE WHERE measureDesc="+measure+" AND corId="+adminID

    db.query(sql,(err,result)=>{
        if(err){
            return res.status(500).json(err)
        }
        else if(result.length>0){
            errors.measureDescription = "Performance Measure with the given name already exists"
            return res.status(400).json(erros)
        }
        sql = "INSERT INTO PERFORMANCE_MEASURE (measureDesc, corId) VALUES("+measure+", "+adminID+")"
        db.query(sql,(err,result)=>{
            if(err){
                return res.status(500).json(err)
            }
            const measureID = result.insertId
            res.status(200).json({measureID,measure})
        })
    })
})

// @route GET api/measures
// @desc Generates all performance measures created by the coordinator
// @access Private

router.get('/measures',passport.authenticate('jwt',{session:false}),(req, res)=>{
    let sql = "SELECT * FROM PERFORMANCE_MEASURE WHERE corId="+db.escape(req.user.id)
    let measures = []
    db.query(sql,(err, result)=>{
        if(err){
           return res.status(500).json(err)
        }
        else if(result.length>0){
            result.forEach(row => {
                measure = {
                    measureID:row.measureID,
                    measureDescription:row.measureDesc
                }
                measures.push(measure)
            })
            
        }
        res.status(200).json(measures)
        
    })
})

module.exports = router