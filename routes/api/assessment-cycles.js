const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const async = require("async");

const db = require("../../config/dbconnection");
const validateCycleInput = require("../../validation/assessment-cycle");
const validateOutcomeInput = require("../../validation/learning-outcome");
const validateMeasureInput = require("../../validation/performance-measure");
const validateAddEvaluatorInput = require("../../validation/addEvaluator");

const router = express.Router();

// @route POST api/cycles/createCycle
// @desc Creates a new Assessment Cycle
// @access Private

router.post(
  "/createCycle",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateCycleInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }

    let adminID = db.escape(req.user.id);
    let cycleName = db.escape(req.body.cycleTitle);
    created = db.escape(new Date());

    let sql =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE corId=" +
      adminID +
      " AND cycleTitle=" +
      cycleName;

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length > 0) {
        errors.cycleTitle = "Cycle with the given name already exists";
        return res.status(404).json(errors);
      }

      sql =
        "INSERT INTO ASSESSMENT_CYCLE (cycleTitle, startDate, corId) VALUES (" +
        cycleName +
        ", " +
        created +
        ", " +
        adminID +
        ")";
      db.query(sql, (err, reslt) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json({ cycleName, created });
      });
    });
  }
);

// @route GET api/cycles
// @desc Provides all the cycle created by logged-in coordinator
// @access Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let adminID = req.user.id;
    let sql =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE corId=" + db.escape(adminID);

    let cycles = [];

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        cycleInfo = {
          cycleName: row.cycleTitle,
          dateCreated: row.startDate,
          cycleID: row.cycleID
        };
        cycles.push(cycleInfo);
      });
      res.status(200).json({ cycles });
    });
  }
);

// @route GET api/cycles/:cycleIdentifier/outcomes
// @desc Retrieves outcomes associated with the current cycle
// @access Private

router.get(
  "/:cycleIdentifier/outcomes",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let adminID = req.user.id;
    let cycleIdentifier = req.params.cycleIdentifier;
    let outcomes = [];

    let sql =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID = " +
      db.escape(cycleIdentifier) +
      " AND corId = " +
      db.escape(adminID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json({
          errors: "Cycle with cycle ID " + cycleIdentifier + " Does not Exist!"
        });
      }
      let cycleName = result[0].cycleTitle;

      let sql1 =
        "SELECT * FROM LEARNING_OUTCOME" +
        " WHERE cycleID=" +
        db.escape(cycleIdentifier) +
        " AND corId=" +
        db.escape(adminID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        result.forEach(row => {
          outcome = {
            outcomeName: row.learnDesc,
            outcomeID: row.learnID
          };
          outcomes.push(outcome);
        });
        res.status(200).json({ outcomes, cycleIdentifier, cycleName });
      });
    });
  }
);

// @route POST api/cycles/:cycleIdentifier/addNewOutcome
// @desc Adds a new outcome within a cycle
// @access Private

router.post(
  "/:cycleIdentifier/addNewOutcome",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateOutcomeInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }

    let cycleID = req.params.cycleIdentifier;
    let adminID = req.user.id;
    let outcomeName = req.body.outcomeDescription;

    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND corId=" +
      db.escape(adminID);
    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.outcomeDescription =
          "Cycle with cycle ID " + cycleID + " Does not Exist!";
        return res.status(404).json(errors);
      }
      let sql =
        "SELECT * FROM LEARNING_OUTCOME WHERE cycleID=" +
        db.escape(cycleID) +
        " AND learnDesc=" +
        db.escape(outcomeName) +
        " AND corId=" +
        db.escape(adminID);
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (result.length > 0) {
          errors.outcomeDescription =
            "The Selected Outcome is already in current Assessment Cycle";
          return res.status(404).json(errors);
        }

        sql =
          "INSERT INTO LEARNING_OUTCOME (cycleID, learnDesc, corId) VALUES (" +
          db.escape(cycleID) +
          ", " +
          db.escape(outcomeName) +
          ", " +
          db.escape(adminID) +
          ")";

        db.query(sql, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          let outcomeID = result.insertId;
          res.status(200).json({ cycleID, outcomeID, adminID, outcomeName });
        });
      });
    });
  }
);

// @route GET api/cycles/:cycleIdentifier/:outcomeIdentifier
// @desc Retrieves all measures associated with the given cycle and outcome
// @access Private

router.get(
  "/:cycleIdentifier/:outcomeIdentifier/measures",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let cycleID = req.params.cycleIdentifier;
    let outcomeID = req.params.outcomeIdentifier;
    let adminID = req.user.id;

    let measures = [];

    let sql1 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND corId=" +
      db.escape(adminID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json({
          errors: "Cycle with ID " + cycleID + " Does not Exist!"
        });
      }

      let sql2 =
        "SELECT * FROM LEARNING_OUTCOME WHERE learnID=" +
        db.escape(outcomeID) +
        " AND corId=" +
        db.escape(adminID);
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } else if (result.length <= 0) {
          return res.status(404).json({
            errors:
              "Learning Outcome with the ID " + outcomeID + " Does not Exist!"
          });
        }

        let outcomeName = result[0].learnDesc;

        let sql3 =
          "SELECT * FROM PERFORMANCE_MEASURE WHERE learnID=" +
          db.escape(outcomeID) +
          " AND corId=" +
          db.escape(adminID);

        db.query(sql3, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          result.forEach(row => {
            measure = {
              measureName: row.measureDesc,
              measureID: row.measureID,
              projectedResult: row.projectedResult,
              projectedStudentNumber: row.projectedStudentsValue,
              courseAssociated: row.courseAssociated,
              toolName: row.toolName,
              toolID: row.toolID
            };
            measures.push(measure);
          });
          res.status(200).json({ measures, cycleID, outcomeID, outcomeName });
        });
      });
    });
  }
);
// @route POST api/cycles/:cycleIdentifier/update
// @desc Updates an  existing Assessment Cycle
// @access Private BIKASH

router.post(
  "/:cycleIdentifier/Update",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateCycleInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }

    let cycleID = req.params.cycleIdentifier;
    let adminID = req.user.id;
    let cycleName = req.body.cycleTitle;
    created = db.escape(new Date());

    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND corId=" +
      db.escape(adminID);

    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.cycleTitle =
          "The given cycle doesn't with cycleID " + cycleID + " exists";
        return res.status(404).json(errors);
      }
      let sql1 =
        "UPDATE ASSESSMENT_CYCLE SET cycleTitle=" +
        db.escape(cycleName) +
        " WHERE cycleID=" +
        db.escape(cycleID);

      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        return res.status(200).json({ cycleName, created, cycleID });
      });
    });
  }
);

// @route POST api/cycles/:cycleIdentifier/Delete
// @desc DELETE an  existing Assessment Cycle
// @access Private BIKASH

router.post(
  "/:cycleIdentifier/Delete",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let cycleID = req.params.cycleIdentifier;
    let adminID = req.user.id;

    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND corId=" +
      db.escape(adminID);

    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors = "The given cycle doesn't with cycleID " + cycleID + " exists";
        return res.status(404).json({ errors });
      }

      let sql1 =
        "DELETE FROM ASSESSMENT_CYCLE WHERE cycleID=" +
        db.escape(cycleID) +
        " AND corId=" +
        db.escape(adminID);

      cycleName = result[0].cycleTitle;

      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        return res.status(200).json({ cycleID, cycleName });
      });
    });
  }
);

// @route POST api/cycles/:cycleIdentifier/outcomes/:outcomeID
// @desc Updates an  outcome of existing assessment Cycle
// @access Private BIKASH
router.post(
  "/:cycleIdentifier/:outcomeIdentifier/Update",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateOutcomeInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }

    let cycleID = req.params.cycleIdentifier;
    let learnID = req.params.outcomeIdentifier;
    let adminID = req.user.id;
    let outcomeName = req.body.outcomeDescription;

    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND corId=" +
      db.escape(adminID);

    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.outcomeDescription =
          "Cycle with cycle ID " + cycleID + " Does not Exist!";
        return res.status(404).json({ errors });
      }
      let sql =
        "SELECT * FROM LEARNING_OUTCOME WHERE cycleID=" +
        db.escape(cycleID) +
        " AND learnID=" +
        db.escape(learnID) +
        " AND corId=" +
        db.escape(adminID);
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (result.length <= 0) {
          errors.outcomeDescription =
            "The Selected Outcome is not in the current Assessment Cycle";
          return res.status(404).json({ errors });
        }
        let sql1 =
          "UPDATE LEARNING_OUTCOME SET learnDesc=" +
          db.escape(outcomeName) +
          "WHERE cycleID=" +
          db.escape(cycleID) +
          " AND learnID=" +
          db.escape(learnID) +
          " AND corId=" +
          db.escape(adminID);

        db.query(sql1, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.status(200).json({ cycleID, learnID, adminID, outcomeName });
        });
      });
    });
  }
);

// @route POST api/cycles/:cycleIdentifier/outcomes/:outcomeID
// @desc DELETE an  outcome of existing assessment Cycle
// @access Private BIKASH
router.post(
  "/:cycleIdentifier/:outcomeIdentifier/Delete",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let cycleID = req.params.cycleIdentifier;
    let learnID = req.params.outcomeIdentifier;
    let adminID = req.user.id;

    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND corId=" +
      db.escape(adminID);

    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors = "Cycle with cycle ID " + cycleID + " Does not Exist!";
        return res.status(404).json({ errors });
      }

      let sql =
        "SELECT * FROM LEARNING_OUTCOME WHERE cycleID=" +
        db.escape(cycleID) +
        " AND learnID=" +
        db.escape(learnID) +
        " AND corId=" +
        db.escape(adminID);
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (result.length <= 0) {
          errors =
            "The Selected Outcome is not in the current Assessment Cycle";
          return res.status(404).json({ errors });
        }
        let sql1 =
          "DELETE FROM LEARNING_OUTCOME WHERE cycleID=" +
          db.escape(cycleID) +
          " AND learnID=" +
          db.escape(learnID) +
          " AND corId=" +
          db.escape(adminID);

        let outcomeName = result[0].learnDesc;
        db.query(sql1, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.status(200).json({ cycleID, learnID, adminID, outcomeName });
        });
      });
    });
  }
);

// @route POST api/cycles/:cycleIdentifier/:outcomeIdentifier/addNewMeasure
// @desc Adds a new measure within an outcome which in turn to cycle
// @access Private

router.post(
  "/:cycleIdentifier/:outcomeIdentifier/addNewMeasure",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateMeasureInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }
    let cycleID = req.params.cycleIdentifier;
    let outcomeID = req.params.outcomeIdentifier;

    let projectedValue = req.body.projectedValue;
    let projectedStudentNumber = req.body.projectedStudentNumber;
    let course = req.body.course;
    let toolType = req.body.toolType;
    let toolName = req.body.toolTitle;

    let studentNumberOperator = req.body.studentNumberOperator;
    let valueOperator = req.body.valueOperator;
    let adminID = req.user.id;

    let toolID = req.body.toolID;

    let measureName =
      "At least " +
      projectedStudentNumber +
      " " +
      studentNumberOperator +
      " in class " +
      course +
      " will score " +
      projectedValue +
      " " +
      valueOperator +
      " or greater in " +
      toolName +
      " " +
      toolType;

    let sql1 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND corId=" +
      db.escape(adminID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res
          .status(404)
          .json({ errors: "Cycle with ID " + cycleID + " Does not Exist!" });
      }

      let sql2 =
        "SELECT * FROM LEARNING_OUTCOME WHERE learnID=" +
        db.escape(outcomeID) +
        " AND corId=" +
        db.escape(adminID);
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } else if (result.length <= 0) {
          return res.status(404).json({
            errors:
              "Learning Outcome with the ID " + outcomeID + " Does not Exist!"
          });
        }
        let sql3 =
          "SELECT * FROM PERFORMANCE_MEASURE WHERE learnID=" +
          db.escape(outcomeID) +
          " AND measureDesc=" +
          db.escape(measureName) +
          " AND corId=" +
          db.escape(adminID);

        db.query(sql3, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          } else if (result.length > 0) {
            errors.measureDescription =
              "The selected performance measure is already associated with this learning outcome";
            return res.status(404).json(errors);
          } else {
            let insertIntoMeasure = () => {
              let sql4 =
                "INSERT INTO PERFORMANCE_MEASURE(learnID, cycleID, measureDesc, projectedResult, projectedStudentsValue, courseAssociated, corId, toolID,toolName, toolType, studentNumberScale,projectedValueScale) VALUES (" +
                db.escape(outcomeID) +
                ", " +
                db.escape(cycleID) +
                ", " +
                db.escape(measureName) +
                ", " +
                db.escape(projectedValue) +
                ", " +
                db.escape(projectedStudentNumber) +
                ", " +
                db.escape(course) +
                ", " +
                db.escape(adminID) +
                ", " +
                db.escape(toolID) +
                ", " +
                db.escape(toolName) +
                ", " +
                db.escape(toolType) +
                ", " +
                db.escape(studentNumberOperator) +
                ", " +
                db.escape(valueOperator) +
                ")";

              db.query(sql4, (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                }
                let measureID = result.insertId;
                res.status(200).json({
                  cycleID,
                  outcomeID,
                  measureID,
                  adminID,
                  measureName,
                  projectedValue,
                  projectedStudentNumber,
                  course,
                  toolType,
                  toolName,
                  studentNumberOperator,
                  valueOperator,
                  toolID
                });
              });
            };
            if (toolType === "test") {
              let sql0 =
                "INSERT INTO TOOL (toolType,corId) VALUES (" +
                db.escape(toolType) +
                ", " +
                db.escape(adminID) +
                ")";
              db.query(sql0, (err, result) => {
                if (err) {
                  return res
                    .status(500)
                    .json("Measure Could not be created \n", err);
                }
                toolID = result.insertId;
                insertIntoMeasure();
              });
            } else {
              insertIntoMeasure();
            }
            //console.log(toolID);


            // });
          }
        });
      });
    });
  }
);
/*
// @route POST api/cycles/:cycleIdentifier/:outcomeIdentifier/addExistingMeasure
router.post(':/cycleIdentifier/:outcomeIdentifier/addExistingMeasure',passport.authenticate('jwt',{session:false}),(req,res)=>{

    let cycleID = req.params.cycleIdentifier;
    let outcomeID = req.params.outcomeIdentifier;
    let measureID = req.body.measureID

    let sql1 = "SELECT * FROM PERFORMANCE_MEASURE WHERE cycleID="+db.escape(cycleID)+" AND learnID="+db.escape(outcomeID)+" AND measureID="+db.escape(measureID)

    db.query(sql1,(err,result)=>{
      if(err){
        return res.status(500).json(err)
      }
      else if(result.length<=0){
        return res.status(404).json({errors:"Params invalid"})
      }
      let measureName=result[0].measureDesc
      let projectedValue = result[0].projectedResult
      let projectedStudentNumber = result[0].projectedStudentsValue
      let toolID = result[0].toolID
      let adminID = req.user.id
      let course = result[0].courseAssociated

      let sql2 = "INSERT INTO PERFORMANCE_MEASURE(measureDesc, projectedResult, projectedStudentsValue, courseAssociated, corId, learnID, cycleID, toolID) VALUES ("+db.escape(measureName)+", "+db.escape(projectedValue)+", "+db.escape(projectedStudentNumber)+", "+db.escape(course)+", "+db.escape(adminID)+", "+db.escape(outcomeID)+", "+db.escape(cycleID)+", "+db.escape(toolID)+")"
      db.query(sql2,(err,result)=>{
        if(err){
          return res.status(500).json(err)
        }
        return res.status(200).json({outcomeID,cycleID,measureName,projectedValue,})
      })
    })

})
*/

// @route GET api/cycles/:cycleIdentifier/:outcomeIdentifier/:measureIdentifier/measureDetails
// @desc Provides details of a  measure within an outcome which in turn to cycle
// @access Private

router.get(
  "/:cycleIdentifier/:outcomeIdentifier/:measureIdentifier/measureDetails",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let cycleID = req.params.cycleIdentifier;
    let outcomeID = req.params.outcomeIdentifier;
    let measureID = req.params.measureIdentifier;

    let sql1 =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID) +
      " AND learnID=" +
      db.escape(outcomeID) +
      " AND cycleID=" +
      db.escape(cycleID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res
          .status(404)
          .json({ errors: "Measure Details could not be retrieved" });
      }

      res.status(200).json({
        cycleID,
        outcomeID,
        measureID,
        measureDescription: result[0].measureDesc,
        projectedResult: result[0].projectedResult,
        resultScale: result[0].projectedValueScale,
        projectedStudentNumber: result[0].projectedStudentsValue,
        studentNumberScale: result[0].studentNumberScale,
        course: result[0].courseAssociated,
        toolName: result[0].toolName,
        toolType: result[0].toolType,
        toolID: result[0].toolID
      });
    });
  }
);

// @route POST api/cycles/:measureIdentifier/addEvaluator
// @desc Add existing Evaluator in the system to performance measure
// @access Private

router.post(
  "/:measureIdentifier/addEvaluator",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateAddEvaluatorInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }
    let evaluatorEmail = req.body.evaluatorEmail;
    let adminID = req.user.id;
    let measureID = req.params.measureIdentifier;

    let sql1 =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json("Measure with the given ID not found");
      }
      let sql2 =
        "SELECT * FROM EVALUATOR WHERE evalEmail=" + db.escape(evaluatorEmail);
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } else if (result.length <= 0) {
          errors.evaluatorEmail =
            "Evaluator Account Does not Exist. Please check the invitee lists or invite the evaluator to create an account";
          return res.status(404).json(errors);
        } else {
          let evalID = result[0].evalID;
          let evaluatorName = result[0].evalName;
          let sql3 =
            "SELECT * FROM MEASURE_EVALUATOR WHERE evalEmail=" +
            db.escape(evaluatorEmail) +
            " AND measureID=" +
            db.escape(measureID);
          db.query(sql3, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            } else if (result.length > 0) {
              errors.evaluatorEmail =
                "You have already added " +
                evaluatorEmail +
                " to the current performance measure";
              return res.status(404).json(errors);
            }
            // let sql11 = "SELECT * FROM EVALUATOR WHERE evalEmail"
            let sql5 =
              "INSERT INTO MEASURE_EVALUATOR (evalEmail,measureID,evalID) VALUES (" +
              db.escape(evaluatorEmail) +
              ", " +
              db.escape(measureID) +
              ", " +
              db.escape(evalID) +
              ")";
            db.query(sql5, (err, result) => {
              if (err) {
                return res.status(500).json(err);
              }
              res.status(200).json({
                evaluatorEmail,
                measureID,
                adminID,
                evaluatorName,
                measureEvalID: result.insertId
              });
            });
          });
        }
      });
    });
  }
);

// @route GET api/:measureIdentifier/measureEvaluators
// @desc Displays Evaluators related to a measure [Coordinator first adds and then evaluator can register]
// @access Private
router.get(
  "/:measureIdentifier/measureEvaluators",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let measureID = req.params.measureIdentifier;
    let evaluators = [];

    let sql =
      "SELECT * FROM MEASURE_EVALUATOR NATURAL JOIN EVALUATOR WHERE measureID=" +
      db.escape(measureID);

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        if (row.evalName != "") {
          evalInfo = {
            measureEvalID: row.measureEvalID,
            name: row.evalName,
            email: row.evalEmail
          };
          evaluators.push(evalInfo);
        }
      });
      res.status(200).json({ evaluators });
    });
  }
);

// @route POST api/cycles/:measureIdentifier/uploadStudents
// @desc Uploads students to be evaluated using file upload
// @access Private

const multer = require("multer");
const csv = require("fast-csv");
const fs = require("fs");
const {
  validateCSVStudents,
  validateCSVStudentsRow,
  validateCSVStudentsTestRow,
  validateCSVTestStudents
} = require("../../validation/uploadStudents");
const upload = multer({
  dest: "measureStudents",
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.csv$/)) {
      return cb(new Error("Please upload a .csv file"));
    }
    cb(undefined, true);
  }
});

router.post(
  "/:measureIdentifier/uploadStudents",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  (req, res) => {
    let measureID = req.params.measureIdentifier;

    let existingStudents = new Set();
    let students = [];

    let sql1 =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json({ errors: "Measure Not Found" });
      } else {
        let sql2 =
          "SELECT * FROM STUDENT WHERE measureID=" + db.escape(measureID);
        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            result.forEach(row => {
              existingStudents.add(row.studentEmail);
            });

            csv
              .fromPath(req.file.path)
              .on("data", data => {
                data.push(req.user.id);
                data.push(measureID);
                students.push(data);
              })
              .on("end", () => {
                fs.unlinkSync(req.file.path);
                const validationError = validateCSVStudents(students);

                if (validationError) {
                  return res.status(404).json({ errors: validationError });
                }
                var existingStudentsInFile = [];
                var newArray = students.filter((row, index) => {
                  if (index !== students.length - 1) {
                    if (existingStudents.has(row[1])) {
                      existingStudentsInFile.push(row[1]);
                      return false;
                    } else {
                      existingStudents.add(row[1]);
                      return true;
                    }
                  }
                });
                //console.log(newArray.length);
                //console.log("Gets Here");
                let sql3 =
                  "INSERT INTO STUDENT (studentName,studentEmail,studentCWID,corId,measureID) VALUES ?";
                if (newArray.length > 0) {
                  db.query(sql3, [newArray], (err, result) => {
                    if (err) {
                      return res.status(500).json(err);
                    }
                  });
                  return res.status(200).json({ existingStudentsInFile });
                } else {
                  return res.status(200).json({ existingStudentsInFile });
                }
              });
          }
        });
      }
    });
  },
  (error, req, res, next) => {
    return res.status(400).json({ errors: error.message });
  }
);

// @route POST api/cycles/:measureIdentifier/uploadTestScores
// @desc Uploads test scores and student details using file upload
// @access Private

router.post(
  "/:measureIdentifier/uploadTestScores",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  (req, res) => {
    let measureID = req.params.measureIdentifier;

    let existingStudents = new Set();
    let students = [];

    let sql1 =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json({ errors: "Measure Not Found" });
      } else {
        let sql2 =
          "SELECT * FROM TEST_SCORE WHERE measureID=" + db.escape(measureID);
        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            result.forEach(row => {
              existingStudents.add(row.testStudentEmail);
            });

            csv
              .fromPath(req.file.path)
              .on("data", data => {
                data.push(req.user.id);
                data.push(measureID);
                students.push(data);
              })
              .on("end", () => {
                fs.unlinkSync(req.file.path);

                const validationError = validateCSVTestStudents(students);

                if (validationError) {
                  return res.status(404).json({ errors: validationError });
                }
                var existingStudentsInFile = [];
                var newArray = students.filter((row, index) => {
                  if (index !== students.length - 1) {
                    if (existingStudents.has(row[1])) {
                      existingStudentsInFile.push(row[1]);
                      return false;
                    } else {
                      existingStudents.add(row[1]);
                      return true;
                    }
                  }
                });
                // console.log(newArray.length);
                // console.log("Gets Here");
                let sql3 =
                  "INSERT INTO TEST_SCORE (testStudentName,testStudentEmail,testStudentCWID,testScore,corId,measureID) VALUES ?";
                if (newArray.length > 0) {
                  db.query(sql3, [newArray], (err, result) => {
                    if (err) {
                      return res.status(500).json(err);
                    }
                  });
                  return res.status(200).json({ existingStudentsInFile });
                } else {
                  return res.status(200).json({ existingStudentsInFile });
                }
              });
          }
        });
      }
    });
  },
  (error, req, res, next) => {
    return res.status(400).json({ errors: error.message });
  }
);

// @route POST api/cycles/:measureIdentifier/addStudent
// @desc Adds student to be evaluated from form
// @access Private

router.post(
  "/:measureIdentifier/addStudent",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let measureID = req.params.measureIdentifier;
    let students = [req.body.name, req.body.email, req.body.CWID];
    let errors = {};

    let sql1 =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json({ errors: "Measure Not Found" });
      } else {
        students.push(measureID);
        students.push(req.user.id);
        const validationError = validateCSVStudentsRow(students);
        if (validationError) {
          errors.validationError = validationError;
          return res.status(404).json(errors);
        } else {
          let name = req.body.name;
          let email = req.body.email;
          let CWID = req.body.CWID;
          let sql2 =
            "SELECT * FROM STUDENT WHERE measureID=" +
            db.escape(measureID) +
            " AND studentEmail=" +
            db.escape(email);
          db.query(sql2, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            } else if (result.length > 0) {
              errors.studentError = "Student Already Exists";
              return res.status(errors);
            } else {
              let sql3 =
                "INSERT INTO STUDENT (studentName, studentEmail,studentCWID, measureID,corId) VALUES (" +
                db.escape(name) +
                ", " +
                db.escape(email) +
                ", " +
                db.escape(CWID) +
                ", " +
                db.escape(measureID) +
                ", " +
                db.escape(req.user.id) +
                ")";
              db.query(sql3, (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                }
                res
                  .status(200)
                  .json({ name, email, CWID, measureID, adminID: req.user.id });
              });
            }
          });
        }
      }
    });
  }
);

// @route POST api/cycles/:measureIdentifier/addStudentScore
// @desc Adds student and score from form
// @access Private

router.post(
  "/:measureIdentifier/addStudentScore",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let measureID = req.params.measureIdentifier;
    let students = [
      req.body.name,
      req.body.email,
      req.body.CWID,
      req.body.score
    ];
    let errors = {};

    let sql1 =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json({ errors: "Measure Not Found" });
      } else {
        students.push(measureID);
        students.push(req.user.id);
        const validationError = validateCSVStudentsTestRow(students);
        if (validationError) {
          errors.validationError = validationError;
          return res.status(404).json(errors);
        } else {
          let name = req.body.name;
          let email = req.body.email;
          let CWID = req.body.CWID;
          let score = parseFloat(req.body.score);
          let sql2 =
            "SELECT * FROM  TEST_SCORE WHERE measureID=" +
            db.escape(measureID) +
            " AND testStudentEmail=" +
            db.escape(email);
          db.query(sql2, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            } else if (result.length > 0) {
              errors.studentError = "Student Already Exists";
              return res.status(errors);
            } else {
              let sql3 =
                "INSERT INTO TEST_SCORE (testStudentName, testStudentEmail,testStudentCWID, testScore, measureID,corId) VALUES (" +
                db.escape(name) +
                ", " +
                db.escape(email) +
                ", " +
                db.escape(CWID) +
                ", " +
                db.escape(score) +
                ", " +
                db.escape(measureID) +
                ", " +
                db.escape(req.user.id) +
                ")";
              db.query(sql3, (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                }
                res.status(200).json({
                  name,
                  email,
                  CWID,
                  measureID,
                  adminID: req.user.id,
                  score
                });
              });
            }
          });
        }
      }
    });
  }
);

// @route GET api/cycles/:measureIdentifier/notAssignedstudentsList
// @desc Lists students associated with the measure but not assigned as well as the total list of students
// @access Private
router.get(
  "/:measureIdentifier/studentsList",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let measureID = req.params.measureIdentifier;

    let students = [];
    let notAssignedStudents = [];
    let studentsEmail = new Set();
    let errors = {};

    let sql =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        errors.identifierError = "Measure ID not found";
        return res.status(404).json(errors);
      }

      let sql1 =
        "SELECT * FROM STUDENT NATURAL LEFT JOIN EVALUATOR_ASSIGN WHERE measureID=" +
        db.escape(measureID);

      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        result.forEach(row => {
          student = {
            name: row.studentName,
            email: row.studentEmail,
            CWID: row.studentCWID,
            studentID: row.studentID
          };
          if (!row.measureEvalID) {
            notAssignedStudents.push(student);
          }
          if (!studentsEmail.has(row.studentEmail)) {
            students.push(student);
            studentsEmail.add(row.studentEmail);
          }
        });
        res.status(200).json({ notAssignedStudents, students });
      });
    });
  }
);

// @route GET api/cycles/:measureIdentifier/assignedStudentsInformation
// @desc List Assigned but not evaluated as well as assigned and evaluated students list
// @access private

router.get(
  "/:measureIdentifier/assignedStudentsInformation",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let measureID = req.params.measureIdentifier;

    let assignedStudentsList = [];
    let evaluatedStudentsList = [];
    let errors = {};

    let sql =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        errors.identifierError = "Measure ID not found";
        return res.status(404).json({ errors });
      }
      let sql1 =
        "SELECT * FROM MEASURE_EVALUATOR NATURAL JOIN EVALUATOR NATURAL JOIN STUDENT NATURAL JOIN EVALUATOR_ASSIGN NATURAL LEFT JOIN EVALUATE WHERE measureID=" +
        db.escape(measureID);

      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        result.forEach(row => {
          student = {
            name: row.studentName,
            email: row.studentEmail,
            CWID: row.studentCWID,
            studentID: row.studentID,
            evalEmail: row.evalEmail,
            evalName: row.evalName,
            measureEvalID: row.measureEvalID
          };
          if (!row.criteriaScore) {
            assignedStudentsList.push(student);
          } else {
            evaluatedStudentsList.push(student);
          }
        });
        res.status(200).json({ assignedStudentsList, evaluatedStudentsList });
      });
    });
  }
);

// @route POST api/cycles/:measureIdentifier/assign
// @desc Assign Rubric and Student to Evaluator for evaluation purpose
// @access private

router.post(
  "/:measureIdentifier/assign",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let measureID = req.params.measureIdentifier;
    let adminID = req.user.id;
    let evalID = req.body.evalID;
    let rubricID = req.body.rubricID;
    alreadyAssignedStudents = [];
    tobeAssignedStudents = [];
    let errors = {};
    let sql =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        errors.identifierError = "Measure ID not found";
        return res.status(404).json(errors);
      } else {
        async.forEachOfSeries(
          req.body.studentIDs,
          (value, key, callback) => {
            let sql1 =
              "SELECT * FROM EVALUATOR_ASSIGN WHERE corId=" +
              db.escape(adminID) +
              " AND measureEvalID=" +
              db.escape(evalID) +
              " AND studentID=" +
              db.escape(value) +
              " AND toolID=" +
              db.escape(rubricID) +
              " AND measureID=" +
              db.escape(measureID);

            db.query(sql1, (err, result) => {
              if (err) {
                return callback(err);
              } else if (result.length > 0) {
                alreadyAssignedStudents.push({
                  studentID: value,
                  evalID,
                  rubricID
                });
                callback();
              } else {
                tobeAssignedStudents.push([
                  adminID,
                  evalID,
                  value,
                  rubricID,
                  measureID
                ]);
                callback();
              }
            });
          },
          err => {
            if (err) {
              return res.status(500).json(err);
            } else {
              let sql2 =
                "INSERT INTO EVALUATOR_ASSIGN (corId,measureEvalID,studentID,toolID,measureID) VALUES ?";
              if (tobeAssignedStudents.length > 0) {
                db.query(sql2, [tobeAssignedStudents], (err, result) => {
                  if (err) {
                    return res.status(500).json(err);
                  }
                  return res
                    .status(200)
                    .json({ alreadyAssignedStudents, tobeAssignedStudents });
                });
              } else {
                return res
                  .status(200)
                  .json({ alreadyAssignedStudents, tobeAssignedStudents });
              }
            }
          }
        );
      }
    });
  }
);

// @route POST api/cycles/:measureIdentifier/measureRubricReport
// @desc Generates Measure Report
// @access private
router.get(
  "/:measureIdentifier/measureRubricReport",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    function round(value, decimals) {
      return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    }

    let adminID = req.user.id;
    let measureID = req.params.measureIdentifier;

    let errors = {};

    let results = [];

    let sql =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID = " +
      db.escape(measureID);

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        errors.measureNotFound = "Measure Not Found";
        return res.status(404).json(errors);
      }
      let threshold = result[0].projectedResult;
      //console.log(threshold);
      let sql1 =
        "SELECT * FROM EVALUATE NATURAL JOIN MEASURE_EVALUATOR NATURAL JOIN PERFORMANCE_MEASURE NATURAL JOIN STUDENT NATURAL JOIN RUBRIC NATURAL JOIN CRITERIA NATURAL JOIN EVALUATOR NATURAL JOIN RUBRIC_SCORE NATURAL JOIN STUDENT_AVERAGE_SCORE WHERE measureID=" +
        db.escape(measureID) +
        " ORDER BY criteriaID,studentID,measureEvalID";
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        let prevCriteria = "";
        let count = 0;
        let weighted = 0;
        result.forEach((row, index) => {
          if (row.weighted) {
            weighted = 1;
          }
          if (index === 0) {
            prevCriteria = row.criteriaID;
          }
          if (row.criteriaID !== prevCriteria) {
            return;
          }
          count++;
        });

        //console.log(count);
        let innerIndex = 0;
        let classAverage = {};
        let passingCounts = {};
        let passingPercentages = {};
        let criteriaInfo = [];
        let criteriaSet = new Set();
        // console.log(result.length);
        result.forEach((row, index) => {
          if (!criteriaSet.has(row.criteriaDesc)) {
            criteriaSet.add(row.criteriaDesc);

            if (weighted) {
              criteriaInfo.push({
                criteriaDescription: row.criteriaDesc,
                criteriaWeight: row.criteriaWeight * 100
              });
            } else {
              criteriaInfo.push({ criteriaDescription: row.criteriaDesc });
            }
          }
          //criteriaSet.add(row.criteriaDesc)
          if (index < count) {
            if (index === 0) {
              classAverage[row.criteriaDesc] = 0;
              classAverage["rubricScore"] = 0;
              passingCounts[row.criteriaDesc] = 0;
              passingCounts["rubricScore"] = 0;
            }
            let indResult = new Object();
            indResult["class"] = row.courseAssociated;
            indResult["studentName"] = row.studentName;
            indResult["evalName"] = row.evalName;
            indResult[row.criteriaDesc] = Math.round(
              row.criteriaScore / row.criteriaWeight
            );
            indResult["rubricScore"] = row.rubricScore;
            indResult["averageScore"] = row.averageScore;
            indResult["studentID"] = row.studentID;
            classAverage[row.criteriaDesc] += Math.round(
              row.criteriaScore / row.criteriaWeight
            );

            classAverage["rubricScore"] += row.rubricScore;
            passingCounts[row.criteriaDesc] =
              Math.round(row.criteriaScore / row.criteriaWeight) >= threshold
                ? passingCounts[row.criteriaDesc] + 1
                : passingCounts[row.criteriaDesc];
            passingCounts["rubricScore"] =
              row.rubricScore >= threshold
                ? passingCounts["rubricScore"] + 1
                : passingCounts["rubricScore"];
            results.push(indResult);
          } else {
            if (index % count !== 0) {
              innerIndex++;
              classAverage[row.criteriaDesc] += Math.round(
                row.criteriaScore / row.criteriaWeight
              );

              passingCounts[row.criteriaDesc] =
                Math.round(row.criteriaScore / row.criteriaWeight) >= threshold
                  ? passingCounts[row.criteriaDesc] + 1
                  : passingCounts[row.criteriaDesc];
              results[innerIndex][row.criteriaDesc] = Math.round(
                row.criteriaScore / row.criteriaWeight
              );
            } else {
              innerIndex = 0;
              classAverage[row.criteriaDesc] = Math.round(
                row.criteriaScore / row.criteriaWeight
              );

              passingCounts[row.criteriaDesc] =
                Math.round(row.criteriaScore / row.criteriaWeight) >= threshold
                  ? 1
                  : 0;
              results[innerIndex][row.criteriaDesc] = Math.round(
                row.criteriaScore / row.criteriaWeight
              );
            }
          }
        });
        for (let average in classAverage) {
          classAverage[average] = round(classAverage[average] / count, 2);
        }
        for (let passingCount in passingCounts) {
          passingPercentages[passingCount] = round(
            (passingCounts[passingCount] / count) * 100,
            2
          );
        }
        let prevStudentID = -1;
        let avgtotalStudentCount = 0;
        let avgPassingStudentCount = 0;
        results.forEach((rslt, index) => {
          if (index === 0) {
            prevStudentID = rslt.studentID;
            avgtotalStudentCount++;
            if (rslt.averageScore >= threshold) {
              avgPassingStudentCount++;
            }
          } else {
            if (prevStudentID !== rslt.studentID) {
              prevStudentID = rslt.studentID;
              avgtotalStudentCount++;
              if (rslt.averageScore >= threshold) {
                avgPassingStudentCount++;
              }
            }
          }
        });
        classAverage["averageScore"] = classAverage.rubricScore;
        passingCounts["averageScore"] = avgPassingStudentCount;
        passingPercentages["averageScore"] = round(
          (avgPassingStudentCount / avgtotalStudentCount) * 100,
          2
        );
        console.log(classAverage);
        console.log(passingCounts);
        console.log(passingPercentages);
        console.log(results);
        res.status(200).json({
          criteriaInfo,
          results,
          classAverage,
          passingCounts,
          passingPercentages,
          numberOfEvaluations: count,
          numberOfUniqueStudents: avgtotalStudentCount
        });
      });
    });
  }
);

// @route POST api/cycles/:measureIdentifier/measureTestReport
// @desc Generates Measure Report for Test tool
// @access private
router.get(
  "/:measureIdentifier/measureTestReport",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let measureID = req.params.measureIdentifier;
    let errors = {};
    let report = [];

    let sql =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID = " +
      db.escape(measureID);

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        errors.measureNotFound = "Measure Not Found";
        return res.status(404).json(errors);
      }
      let threshold = result[0].projectedResult;
      let sql1 =
        "SELECT * FROM TEST_SCORE WHERE measureID=" + db.escape(measureID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        let totalStudents = result.length;
        let passingCounts = 0;
        result.forEach(row => {
          result = {
            studentName: row.testStudentName,
            studentEmail: row.testStudentEmail,
            CWID: row.testStudentCWID,
            score: row.testScore,
            passing: row.testScore >= threshold ? true : false
          };
          report.push(result);
          if (row.testScore >= threshold) {
            passingCounts++;
          }
        });
        let passingPercentage = 0;
        if (totalStudents !== 0 && passingCounts !== 0) {
          passingPercentage = Number(
            Math.round((passingCounts / totalStudents) * 100 + "e2") + "e-2"
          );
        }
        res
          .status(200)
          .json({ report, totalStudents, passingCounts, passingPercentage });
      });
    });
  }
);
module.exports = router;
