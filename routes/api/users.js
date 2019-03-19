const  express = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')

const keys = require('../../config/keys')

//Load database connection
const db = require('../../config/dbconnection')


const router  = express.Router()

//Load user validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// @route POST api/users/register
// @desc Register admin [Temporary purpose]
// @access Public

router.post('/register', (req, res)=>{
    const {errors, isValid} = validateRegisterInput(req.body)
    if(!isValid){
        return res.status(400).json(errors)
    }
     //Check if user already exists in the database
    let email = db.escape(req.body.email)
    let sql = "SELECT * FROM COORDINATOR WHERE corEmail = "+ email
    db.query(sql, (err, result)=>{
        // if(err){
        //     return res.status(500).json(error)
        // }
        if(result.length>0){
            errors.email='Email already exists'
            return res.status(400).json(errors)
        }
        else if (err){
            return res.status(500).json(err)
        }
        else{

        }
        let adminName = db.escape(req.body.name) 
        let password = db.escape(req.body.password)
    
                //password = hash//not able to insert hashed password into database
                sql = 'INSERT INTO COORDINATOR (corName, corEmail, corPWHash) VALUES ('+adminName+','+email+',password('+password+'))'
                db.query(sql,(err, result)=>{
                    // if (err){
                    //     console.log(err)
                    //     return res.status(500).json(err)
                    // }
                    if (result){
                        return res.status(200).json(result)
                    }
                    else if (err){
                        return res.status(400).json(err)
                    }
                })
    })
})

// @route POST api/users/login
// @desc Login User
// @access Public

router.post('/login',(req, res)=>{
    //req body input validation
    const {errors, isValid} = validateLoginInput(req.body)
    if(!isValid){
        return res.status(400).json(errors)
    }
    let email = req.body.email
    let password = req.body.password

    let sql = "SELECT * from COORDINATOR WHERE corEmail="+db.escape(email)+" and corPWHash=password("+db.escape(password)+")"
    db.query(sql, (err, result)=>{
        if(err){
            return res.status(500).json(err)
        }

        //User email and password exists
        else if (result.length>0){
            const payload = {
                email,
                name:result[0].corName,
                id:result[0].corId,
                role:'coordinator'
            }

            jwt.sign(
                payload,
                keys.secretOrkey,
                {
                    expiresIn:5400
                },
                (err, token)=>{
                    res.status(200).json({
                        success:true,
                        token:'Bearer '+token
                    })
                }

            )
        }
        else if (result.length<=0){
            sql = "SELECT * from EVALUATOR WHERE evalEmail="+db.escape(email)+" and evalPWHash= password("+db.escape(password)+")"
            db.query(sql,(err,result)=>{
                if(err){
                    return res.status(500).json(err)
                }
        
                //User email and password exists
                else if (result.length>0){
                    const payload = {
                        email,
                        name:result[0].evalName,
                        id:result[0].evalID,
                        role:'evaluator'
                    }
        
                    jwt.sign(
                        payload,
                        keys.secretOrkey,
                        {
                            expiresIn:5400
                        },
                        (err, token)=>{
                            res.status(200).json({
                                success:true,
                                token:'Bearer '+token
                            })
                        }
        
                    )
                }
                else{
                    errors.password = "Password Incorrect"
                    res.status(400).json(errors);
                }
            })
        }
        
    })
})

module.exports = router

