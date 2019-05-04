const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const Validator = require("validator");

const isEmpty = require("../../validation/isEmpty");
const keys = require("../../config/keys");

//Load database connection
const db = require("../../config/dbconnection");

const router = express.Router();

//Load user validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateAddEvaluatorInput = require("../../validation/addEvaluator");
validateUpdatePasswordInput = require("../../validation/updatePassword");

// @route POST api/users/register
// @desc Register admin
// @access Public

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(404).json(errors);
  }
  //Check if user already exists in the database
  let email = req.body.email;
  let tempCode = req.body.tempCode;
  //let program = req.body.program;
  let sql =
    "SELECT * FROM INVITED_COORDINATOR WHERE invitedCorEmail = " +
    db.escape(email) +
    " AND corTempCode=password(" +
    db.escape(tempCode) +
    ")";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(error);
    }

    if (result.length > 0) {
      let adminFirstName = req.body.firstName;
      let adminLastName = req.body.lastName;
      let password = req.body.password;
      let programID = result[0].programID;

      sql =
        "INSERT INTO COORDINATOR (corFirstName, corLastName,corEmail, corPWHash, programID) VALUES (" +
        db.escape(adminFirstName) +
        "," +
        db.escape(adminLastName) +
        ", " +
        db.escape(email) +
        ",password(" +
        db.escape(password) +
        ") " +
        "," +
        db.escape(programID) +
        ")";

      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        let sql5 =
          "SELECT * FROM EVALUATOR WHERE evalEmail=" +
          db.escape(email) +
          " AND programID=" +
          db.escape(programID);
        db.query(sql5, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          if (result.length <= 0) {
            let sql0 =
              "INSERT INTO EVALUATOR (evalFirstName, evalLastName,programID, evalEmail,evalPWHash) VALUES (" +
              db.escape(adminFirstName) +
              "," +
              db.escape(adminLastName) +
              ", " +
              db.escape(programID) +
              ", " +
              db.escape(email) +
              ",password(" +
              db.escape(password) +
              "))";
            db.query(sql0, (err, result) => {
              if (err) {
                return res.status(500).json(err);
              }
              let sql0 =
                "UPDATE EVALUATOR SET evalPWHash=password(" +
                db.escape(password) +
                ") WHERE evalEmail=" +
                db.escape(email) +
                " AND programID=" +
                db.escape(programID);
              db.query(sql0, (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                }
                let sql1 =
                  "DELETE FROM INVITED_COORDINATOR WHERE invitedCorEmail = " +
                  db.escape(email);
                db.query(sql1, (err, result) => {
                  if (err) {
                    return res.status(500).json(err);
                  } else {
                    return res.status(200).json(result);
                  }
                });
              });
            });
          } else {
            let sql1 =
              "DELETE FROM INVITED_COORDINATOR WHERE invitedCorEmail = " +
              db.escape(email);
            db.query(sql1, (err, result) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                return res.status(200).json(result);
              }
            });
          }
        });
      });
    } else if (result <= 0) {
      let sql2 =
        "SELECT * FROM INVITED_EVALUATOR WHERE invitedEvalEmail = " +
        db.escape(email) +
        " AND evalTempCode = password (" +
        db.escape(tempCode) +
        ")";
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (result.length > 0) {
          let evalFirstName = req.body.firstName;
          let evalLastName = req.body.lastName;
          let password = req.body.password;
          let sql3 =
            "INSERT INTO EVALUATOR (evalFirstName, evalLastName, programID, evalEmail, evalPWHash) VALUES(" +
            db.escape(evalFirstName) +
            ", " +
            db.escape(evalLastName) +
            ", " +
            db.escape(result[0].programID) +
            ", " +
            db.escape(email) +
            ", password(" +
            db.escape(password) +
            "))";

          db.query(sql3, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }
            let sql4 =
              "DELETE FROM INVITED_EVALUATOR WHERE invitedEvalEmail = " +
              db.escape(email);

            db.query(sql4, (err, result) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                return res.status(200).json(result);
              }
            });
          });
        } else {
          errors.email =
            "Either your account already exists or you have entered incorrect temporary code";
          return res.status(404).json({ errors });
        }
      });
    }
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
    "SELECT * from SUPER_USER WHERE superEmail=" +
    db.escape(email) +
    " and superPassword=password(" +
    db.escape(password) +
    ")";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    } else if (result.length > 0) {
      const payload = {
        email,
        id: result[0].superID,
        role: "superuser"
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
    } else if (result <= 0) {
      let sql =
        "SELECT * from COORDINATOR NATURAL JOIN PROGRAM WHERE isActive=true AND corEmail=" +
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
            name: result[0].corFirstName + " " + result[0].corLastName,
            id: result[0].corId,
            programID: result[0].programID,
            role: "coordinator",
            programName: result[0].programName
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
            "SELECT * from EVALUATOR WHERE isActive=true AND evalEmail=" +
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
                name: result[0].evalFirstName + " " + result[0].evalLastName,
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
    }
  });
});

// @route POST api/users/loginAsEval
// @desc Switch to Evaluator Mode
// @access private

router.post(
  "/loginAsEval",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let sql =
      "SELECT * from EVALUATOR WHERE isActive=true AND evalEmail=" +
      db.escape(req.user.email);
    let errors = {};
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      //User email and password exists
      else if (result.length > 0) {
        const payload = {
          email: req.user.email,
          name: result[0].evalFirstName + " " + result[0].evalLastName,
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
);

//Update Name for Coordinator
router.post(
  "/updateCorName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = {};
    if (isEmpty(req.body.firstName)) {
      errors.message = "First Name field cannot be empty";
      return res.status(404).json(errors);
    }
    if (isEmpty(req.body.lastName)) {
      errors.message = " Last Name field cannot be empty";
      return res.status(404).json(errors);
    }
    let corFirstName = req.body.firstName;
    let corLastName = req.body.lastName;

    let sql = "SELECT * FROM COORDINATOR WHERE corId=" + db.escape(req.user.id);

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.message = "Coordinator Does not exist!";
        return res.status(404).json(errors);
      }
      let sql1 =
        "UPDATE COORDINATOR SET corFirstName=" +
        db.escape(corFirstName) +
        ", corLastName=" +
        db.escape(corLastName) +
        " WHERE corId=" +
        db.escape(req.user.id);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        let sql2 =
          "UPDATE EVALUATOR SET evalFirstName=" +
          db.escape(corFirstName) +
          ", evalLastName=" +
          db.escape(corLastName) +
          " WHERE evalEmail=" +
          db.escape(req.user.email) +
          " AND programID=" +
          db.escape(req.user.programID);
        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          res.status(200).json("Name Updated Successfully!");
        });
      });
    });
  }
);

//update Name for evaluator
router.post(
  "/updateEvalName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = {};
    if (isEmpty(req.body.firstName)) {
      errors.message = "First Name field cannot be empty";
      return res.status(404).json(errors);
    }
    if (isEmpty(req.body.lastName)) {
      errors.message = " Last Name field cannot be empty";
      return res.status(404).json(errors);
    }
    let evalFirstName = req.body.firstName;
    let evalLastName = req.body.lastName;

    let sql =
      "SELECT * FROM COORDINATOR WHERE isActive=true AND corEmail=" +
      db.escape(req.user.email);

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length > 0) {
        errors.messsage = "You can only update your name from Coordinator mode";
        return res.status(404).json(errors);
      }
      let sql1 =
        "SELECT * FROM EVALUATOR WHERE evalID=" + db.escape(req.user.id);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        if (result.length <= 0) {
          errors.message = "Account Does not Exist!";
          return res.status(404).json(errors);
        }
        let sql2 =
          "UPDATE EVALUATOR SET evalFirstName=" +
          db.escape(evalFirstName) +
          ", evalLastName=" +
          db.escape(evalLastName) +
          " WHERE evalID=" +
          db.escape(req.user.id);

        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          res.status(200).json("Name Updated Successfully!");
        });
      });
    });
  }
);

//Update Password for Coordinator
router.post(
  "/updateEvalPassword",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateUpdatePasswordInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }

    let oldcorPWHash = req.body.oldPassword;
    let newcorPWHash = req.body.password;

    let sql =
      "SELECT * FROM COORDINATOR WHERE corId=" +
      db.escape(req.user.id) +
      " AND corPWHash=password(" +
      db.escape(oldcorPWHash) +
      ")";

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.message = "Incorrect Old Password!";
        return res.status(404).json(errors);
      }

      let sql1 =
        "UPDATE COORDINATOR SET corPWHash=password(" +
        db.escape(newcorPWHash) +
        ") WHERE corId=" +
        db.escape(req.user.id);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        let sql2 =
          "UPDATE EVALUATOR SET evalPWHash=password(" +
          db.escape(newcorPWHash) +
          ") WHERE evalEmail=" +
          db.escape(req.user.email) +
          " AND programID=" +
          db.escape(req.user.programID);
        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          res.status(200).json("Password Updated Successfully!");
        });
      });
    });
  }
);

//Update Password for Evaluator
router.post(
  "/updateCorPassword",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateUpdatePasswordInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }

    let oldcorPWHash = req.body.oldPassword;
    let newcorPWHash = req.body.password;

    let sql =
      "SELECT * FROM COORDINATOR WHERE isActive = true AND corEmail=" +
      db.escape(req.user.email);
    // " AND corPWHash=password(" +
    // db.escape(oldcorPWHash) +
    // ")";

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length > 0) {
        errors.message =
          "You can only update your password from Coordinator mode";
        return res.status(404).json(errors);
      }
      let sql1 =
        "SELECT * FROM EVALUATOR WHERE evalID=" +
        db.escape(req.user.id) +
        " evalPWHash=password(" +
        db.escape(oldcorPWHash);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } else if (result.length <= 0) {
          errors.message = "Incorrect Old Password!";
          return res.status(404).json(errors);
        }
        let sql3 =
          "UPDATE EVALUATOR SET evalPWHash=password(" +
          db.escape(newcorPWHash) +
          ") WHERE evalID=" +
          db.escape(req.user.id);
        db.query(sql3, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          res.status(200).json("Password Updated Successfully!");
        });
      });
    });
  }
);
module.exports = router;
