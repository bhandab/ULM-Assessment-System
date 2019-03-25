const express = require('express')
const passport = require('passport')
const async = require('async')

const db = require('../../config/dbconnection')
const validateRubricStructureInput = require('../../validation/rubric')

const router = express.Router()

router.post('/createRubric',passport.authenticate('jwt',{session:false}),(req,res)=>{

    let {errors,isValid} = validateRubricStructureInput(req.body)

    if(!isValid){
        return res.status(400).json(errors)
    }
    
    let noOfRows =req.body.rows
    let noOfColumns = req.body.columns
    let rubricTitle = req.body.rubricName
    let adminID = req.user.id

    let rubricDetails = {

    }
    

    
    let sql = "SELECT * FROM RUBRIC WHERE rubricTitle="+db.escape(rubricTitle)
    db.query(sql, (err,result)=>{
        if(err){
            return res.status(500).json(err)
        }
        if(result.length>0){
            
            errors.rubricName = "Rubric with this name already exists"
            
            return res.status(400).json(errors)
            
        }
        let sql1 = "INSERT INTO TOOL (toolType, corId) VALUES ("+"'Rubric', "+db.escape(adminID)+")"
        db.query(sql1,(err,result)=>{
            if(err){
                return res.status(500).json(err)
            }
            let rubricID = result.insertId
            let sql2 = "INSERT INTO RUBRIC (toolID,rubricTitle,rubricRows,rubricColumns) "+
                        "VALUES ("+db.escape(rubricID)+", "+db.escape(rubricTitle)+", "+db.escape(noOfRows)+", "+db.escape(noOfColumns)+")"
            
            db.query(sql2,(err,result)=>{
                if(err){
                    return res.status(500).json(err)
                }
                rubricDetails.strutureInfo = {noOfRows,noOfColumns,rubricTitle,rubricID,adminID}
                //console.log(rubricDetails)
                let scales = []
                let values = []
                let sql3 = "INSERT INTO RATING_SCALE (toolID, scaleDesc) VALUES ?"
                let scaleDescription = ""
                for (var i = 1; i<noOfRows; i++){
                   //console.log(parseInt(noOfRows))
                    values.push([rubricID, scaleDescription])
                    //console.log(values[i])
                    
                }
               //console.log(values,values.length)
                
                db.query(sql3,[values],(err,result)=>{
                    if(err){
                        return res.status(500).json(err)
                    }
                    
                    //res.status(200).json(result)
                    let scaleID = result.insertId
                    for (var i = 1; i<noOfRows; i++){
                        scales.push({scaleID,scaleDescription})
                        scaleID++
                    }
                    rubricDetails.scaleInfo = scales



                    let criterias=[]
                    let crValues=[]
                    let sql4 = "INSERT INTO CRITERIA (toolID,criteriaDesc) VALUES ?"
                    let criteriaDescription = ""
                    for (var i = 1; i<noOfColumns;i++){
                        crValues.push([rubricID,criteriaDescription])
                    }

                    db.query(sql4,[crValues],(err,result)=>{
                        if(err){
                            return res.status(500).json(err)
                        }
                        let criteriaID = result.insertId
                        for (var i = 1; i<noOfColumns;i++){
                            criterias.push({criteriaID,criteriaDescription})
                            criteriaID++
                        }
                        rubricDetails.criteriaInfo = criterias


                        let table = []
                        
                        async.forEachOf(criterias,  function(value,key,callback){
                            
                            let cellDescription = "";
                            let associatedCriteraID = value.criteriaID
                            console.log(associatedCriteraID)
                            let rows = []
                            async.forEachOf(scales, function(value,key,inner_callback){
                                let associatedScaleID = value.scaleID
                                console.log(associatedScaleID)
                                let sql5 = "INSERT INTO LEVEL_DESCRIPTION (criteriaID, scaleID) "+
                                            "VALUES ("+associatedCriteraID+", "+associatedScaleID+")"
                                            console.log(sql5)

                                   db.query(sql5,function (err,result){
                                    if(!err){
                                        console.log(result)
                                        let levelID = result.insertId
                                        rows.push({
                                            levelID,
                                            associatedCriteraID,
                                            associatedScaleID,
                                             cellDescription
                                         })
                                         inner_callback()
                                    }
                                    else{
                                        console.log("Reaches here")
                                        inner_callback(err)
                                    }
                                    //console.log(result)
                                    //let levelID = result.insertId
                                    
                                })
                            },function(err){
                                if(err){
                                    throw err
                                }
                                else{
                                    console.log(rows)
                                    table.push(rows)
                                    console.log(table)
                                    
                                }
                                
                                
                                
                            })
                            
                            callback()
                        },function(err){
                            if(err){
                                 throw err
                            }
                            else{
                                rubricDetails.cellInfo = table
                                res.status(200).json({rubricDetails})
                            }
                        })
                        

                        
                        /*for(var i = 1; i<noOfRows;i++){
                            let associatedCriteraID = criterias[i-1].criteriaID
                            let rows = []
                            for(var j=1; j<noOfColumns;j++){
                                 
                                let associatedScaleID = scales[j-1].scaleID
                                let sql5 = "INSERT INTO LEVEL_DESCRIPTION (criteriaID,scaleID, levelDesc) VALUES ("+associatedCriteraID+", "+associatedScaleID+", "+cellDescription+")"
                                db.query(sql5,(err,result)=>{
                                    if(err){
                                        throw err
                                    }
                                    let levelID = result.insertId
                                    rows.push({
                                       levelID,
                                       associatedCriteraID,
                                       associatedScaleID,
                                        cellDescription
                                    })
                                })
                            }
                            table.push(rows)
                        }
                        rubricDetails.cellInfo = table
                        res.status(200).json({rubricDetails})*/

                    })

                })
            })
        })
    })

})

module.exports = router