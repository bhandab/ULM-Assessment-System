const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const keys = require("../../config/keys");

//Load database connection
const db = require("../../config/dbconnection");

const router = express.Router();

//Load user validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateAddEvaluatorInput = require("../../validation/addEvaluator");

// @route POST api/users/register
// @desc Register admin [Temporary purpose]
// @access Public

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(404).json(errors);
  }
  //Check if user already exists in the database
  let email = req.body.email;
  let program = req.body.program;
  let sql =
    "SELECT * FROM COORDINATOR WHERE corEmail = " +
    db.escape(email) +
    " AND programName = " +
    db.escape(program);
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(error);
    }
    if (result.length > 0) {
      errors.email = "Email already exists";
      return res.status(404).json(errors);
    }

    let adminName = req.body.name;
    let password = req.body.password;

    sql =
      "INSERT INTO COORDINATOR (corName, corEmail, corPWHash, programName) VALUES (" +
      db.escape(adminName) +
      "," +
      db.escape(email) +
      ",password(" +
      db.escape(password) +
      ") " +
      "," +
      db.escape(program) +
      ")";
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result) {
        return res.status(200).json(result);
      }
    });
  });
});

// @route POST api/users/registerEvaluator
// @desc Register evaluator
// @access Protected

router.post("/registerEvaluator", (req, res) => {
  let { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(404).json(errors);
  }

  let evalName = req.body.name;
  let email = req.body.email;
  let password = req.body.password;

  let sql =
    "SELECT * FROM INVITED_EVALUATOR WHERE invitedEvalEmail=" +
    db.escape(email);
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    } else if (result.length <= 0) {
      errors.email =
        "You have not been added in the system yet. Please check with your coordinator";
      return res.status(404).json(errors);
    }

    sql =
      "INSERT INTO EVALUATOR (evalName, evalEmail, evalPWHash) VALUES(" +
      db.escape(evalName) +
      ", " +
      db.escape(email) +
      ", password(" +
      db.escape(password) +
      "))";
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      let sql1 =
        "DELETE FROM INVITED_EVALUATOR WHERE invitedEvalEmail=" +
        db.escape(email);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(200).json(result);
      });
    });
  });
});

// @route POST api/users/login
// @desc Login User
// @access Public

router.post("/login", (req, res) => {
  //req body input validation
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(404).json(errors);
  }
  let email = req.body.email;
  let password = req.body.password;

  let sql =
    "SELECT * from COORDINATOR WHERE corEmail=" +
    db.escape(email) +
    " and corPWHash=password(" +
    db.escape(password) +
    ")";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    //User email and password exists
    else if (result.length > 0) {
      const payload = {
        email,
        name: result[0].corName,
        id: result[0].corId,
        role: "coordinator"
      };

      jwt.sign(
        payload,
        keys.secretOrkey,
        {
          expiresIn: 5400
        },
        (err, token) => {
          res.status(200).json({
            success: true,
            token: "Bearer " + token
          });
        }
      );
    } else if (result.length <= 0) {
      sql =
        "SELECT * from EVALUATOR WHERE evalEmail=" +
        db.escape(email) +
        " and evalPWHash= password(" +
        db.escape(password) +
        ")";
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        //User email and password exists
        else if (result.length > 0) {
          const payload = {
            email,
            name: result[0].evalName,
            id: result[0].evalID,
            role: "evaluator"
          };

          jwt.sign(
            payload,
            keys.secretOrkey,
            {
              expiresIn: 5400
            },
            (err, token) => {
              res.status(200).json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          errors.password = "Password Incorrect";
          res.status(404).json(errors);
        }
      });
    }
  });
});

module.exports = router;
