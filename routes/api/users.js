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

  let evalName = db.escape(req.body.name);
  let email = db.escape(req.body.email);
  let password = db.escape(req.body.password);

  let sql = "SELECT * FROM EVALUATOR WHERE evalEmail=" + email;
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    } else if (result.length <= 0) {
      errors.email =
        "You have not been added by coordinator yet; please contact the coordinator!";
      return res.status(404).json(errors);
    }

    sql =
      "UPDATE EVALUATOR SET evalName=" +
      evalName +
      ", evalPWHash=password(" +
      password +
      ") WHERE evalEmail=" +
      email;
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(200).json(result);
    });
  });
});

// @route POST api/users/addEvaluator
// @desc Add Evaluator [Coordinator first adds and then evaluator can register]
// @access Private

/*
router.post(
  "/addEvaluator",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateAddEvaluatorInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }
    let evaluatorEmail = db.escape(req.body.evaluatorEmail);
    let adminID = db.escape(req.user.id);
    let sql =
      "SELECT * FROM EVALUATOR WHERE evalEmail=" +
      evaluatorEmail +
      " AND corId=" +
      adminID;
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length > 0) {
        errors.evaluatorEmail =
          "You have already added evaluator with this email";
        return res.status(404).json(errors);
      }
      sql =
        "INSERT INTO EVALUATOR (evalEmail,corId) VALUES (" +
        evaluatorEmail +
        ", " +
        adminID +
        ")";
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json({ evaluatorEmail, adminID });
      });
    });
  }
);*/

/*
// @route POST api/users/myEvaluators
// @desc Displays Evaluators [Coordinator first adds and then evaluator can register]
// @access Private
router.get(
  "/myEvaluators",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let evaluators = [];

    let sql = "SELECT * FROM EVALUATORS WHERE corId=" + db.escape(req.user.id);

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        if (row.evalName != "") {
          evaluators.push(row.evalName);
        }
      });
      res.status(200).json({ evaluators });
    });
  }
);*/

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
