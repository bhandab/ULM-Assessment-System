const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const db = require('../../config/dbconnection')
const validateCycleInput = require('../../validation/assessment-cycle')

const router = express.Router()

// @route POST api/cycles/createCycle
// @desc Creates a new Assessment Cycle
// @access Private

router.post('/createCycle',passport.authenticate('jwt',{session:false}),(req, res)=>{

    let {errors,isValid} = validateCycleInput(req.body)
    if(!isValid){
       return res.status(400).json(errors)
    }

    let adminID = db.escape(req.user.id)
    let cycleName = db.escape(req.body.cycleTitle)
    created = db.escape(new Date())

    let sql = "SELECT * FROM ASSESSMENT_CYCLE WHERE corId="+adminID+" AND cycleTitle="+cycleName

    db.query(sql,(err,result)=>{
        if(err){
            return res.status(500).json(err)
        }
        else if(result.length>0){
            errors.cycleTitle = "Cycle with the given name already exists"
            return res.status(400).json(errors)
        }

        sql = "INSERT INTO ASSESSMENT_CYCLE (cycleTitle, startDate, corId) VALUES (" + cycleName + ", " + created + ", "+adminID+")"
        db.query(sql,(err,reslt)=>{
            if(err){
                return res.status(500).json(err)
            }
            return res.status(200).json({cycleName,created})
        })
    })

})

// @route GET api/cycles
// @desc Provides all the cycle created by logged-in coordinator
// @access Private

router.get('/',passport.authenticate('jwt',{session:false}),(req, res)=>{

    let adminID = db.escape(req.user.id)
    let sql = "SELECT * FROM ASSESSMENT_CYCLE WHERE corId="+adminID

    let cycles = [];

    db.query(sql,(err, result)=>{
        if(err){
            return res.status(500).json(err)
        }
        result.forEach(row => {
            cycleInfo = {
                cycleName:row.cycleTitle,
                dateCreated:row.startDate,
                cycleID:row.cycleID
            }
            cycles.push(cycleInfo)
        })
        res.status(200).json({cycles})
    })
})

// @route GET api/cycles/:cycleIdentifier
// @desc Provides outcomes associated with the current cycle 
// @access Private

router.get('/:cycleIdentifier',passport.authenticate('jwt',{session:false}),(req, res)=>{
    
    let adminID = db.escape(req.user.id);
    let cycleIdentifier = db.escape(req.params.cycleIdentifier)
    let outcomes = []

    let sql = "SELECT * FROM CYCLE_OUTCOME_ASSOCIATION NATURAL JOIN LEARNING_OUTCOME"+
            " WHERE cycleID="+cycleIdentifier+" AND corId="+adminID
    db.query(sql,(err,result)=>{
        if(err) {return res.status(500).json(err)}
        //let name = angel
        result.forEach(row=>{
            outcome = {
                outcomeName:row.learnDesc,
                outcomeID: row.learnID,
                
            }
            outcomes.push(outcome)
        })
        let sql1 = "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID = " + cycleIdentifier +" AND corId = "+adminID
        db.query(sql1, (err, result) => {
            if (err) { return res.status(500).json(err) }  
            console.log(result)
            let cycleName = result[0].cycleTitle
          
            res.status(200).json({ outcomes, cycleIdentifier, cycleName })

        })
        
    })

})

// @route POST api/cycles/:cycleIdentifier/:outcomeIdentifier
// @desc Relates an outcome with a cycle
// @access Private

router.post('/:cycleIdentifier/:outcomeIdentifier',passport.authenticate('jwt',{session:false}),(req, res)=>{
    let cycleID = db.escape(req.params.cycleIdentifier)
    let outcomeID = db.escape(req.params.outcomeIdentifier)
    let adminID = db.escape(req.user.id)
    
    let sql = "SELECT * FROM CYCLE_OUTCOME_ASSOCIATION WHERE cycleID="+cycleID+" AND learnID="+outcomeID+" AND corId="+adminID
    db.query(sql,(err,result)=>{
        if(err) {
            return res.status(500).json(err)
        }

        if(result.length>0){
            return res.status(400).json({errors:"The Selected Outcome is already in current Assessment Cycle"})
        }

        sql = "INSERT INTO CYCLE_OUTCOME_ASSOCIATION (cycleID, learnID, corId) VALUES ("+cycleID+", "+outcomeID+", "+adminID+")"

        db.query(sql,(err, result)=>{
            if(err){
                return res.status(500).json(err)
            }
            let sql1 = "SELECT * FROM LEARNING_OUTCOME WHERE learnID="+outcomeID+" AND corId="+adminID
            db.query(sql1,(err,result)=>{
                if(err){
                    return res.status(500).json(err)
                }
                
                if(result.length>0){
                    outcomeName = result[0].learnDesc
                    res.status(200).json({cycleID,outcomeID,adminID,outcomeName})
                }
            })
            
        })
    })

})

// @route GET api/cycles/:cycleIdentifier/:outcomeIdentifier
// @desc Retrieves measure associated with the given cycle and outcome
// @access Private

router.get('/:cycleIdentifier/:outcomeIdentifier',passport.authenticate('jwt',{session:false}),(req, res)=>{

    let cycleID = db.escape(req.params.cycleIdentifier)
    let outcomeID = db.escape(req.params.outcomeIdentifier)
    let adminID = db.escape(req.user.id)

    let measures = []

    let sql = "SELECT * FROM OUTCOME_MEASURE_ASSOCIATION NATURAL JOIN CYCLE_OUTCOME_ASSOCIATION "+
                "NATURAL JOIN PERFORMANCE_MEASURE WHERE cycleID="+cycleID+" AND learnID="+outcomeID+
                " AND corId="+adminID

    db.query(sql,(err,result)=>{
        if(err){
            return res.status(500).json(err)
        }
        result.forEach(row=>{
            measure = {
                measureName:row.measureDesc,
                measureID:row.measureID
            }
            measures.push(measure)
        })
        res.status(200).json({measures, cycleID,outcomeID})
    })
})


// @route POST api/cycles/:cycleIdentifier/:outcomeIdentifier/:measureIdentifier
// @desc Relates a measure with a outcome which in turn to cycle
// @access Private 

router.post('/:cycleIdentifier/:outcomeIdentifier/:measureIdentifier',passport.authenticate('jwt',{session:false}),(req, res)=>{
    let cycleID = db.escape(req.params.cycleIdentifier)
    let outcomeID = db.escape(req.params.outcomeIdentifier)
    let measureID = db.escape(req.params.measureIdentifier)
    let adminID = db.escape(req.user.id)

    let sql = "SELECT * FROM OUTCOME_MEASURE_ASSOCIATION WHERE cycleID="+cycleID+" AND learnID="+outcomeID+" AND measureID="+measureID
    db.query(sql,(err, result)=>{
        if(err){
            return res.status(500).json(err)
        }
        else if(result.length>0){
            return res.status(400).json({errors:"The selected performance measure is already associated with this learning outcome"})
        }
        else{
            sql = "INSERT INTO OUTCOME_MEASURE_ASSOCIATION (cycleID, learnID, measureID) VALUES ("+cycleID+", "+outcomeID+", "+measureID+")"
            db.query(sql,(err,result)=>{
                if(err){
                    return res.status(500).json(err)
                }
                let sql1 = "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID="+measureID+" AND corId="+adminID
                db.query(sql1,(err,result)=>{
                    if(err){
                        return res.status(500).json(err)
                    }
                    measureName = result[0].measureDesc
                    res.status(200).json({cycleID,outcomeID,measureID,adminID,measureName})
                })
            })
        }
    })
})

module.exports = router