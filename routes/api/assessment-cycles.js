const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const async = require("async");
const Validator = require("validator");

const db = require("../../config/dbconnection");
const validateCycleInput = require("../../validation/assessment-cycle");
const validateOutcomeInput = require("../../validation/learning-outcome");
const validateMeasureInput = require("../../validation/performance-measure");
const validateAddEvaluatorInput = require("../../validation/addEvaluator");
const isEmpty = require("../../validation/isEmpty");

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

    let programID = db.escape(req.user.programID);
    let cycleName = db.escape(req.body.cycleTitle);

    let sql =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE programID=" +
      programID +
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
        "INSERT INTO ASSESSMENT_CYCLE (cycleTitle, startDate, programID) VALUES (" +
        cycleName +
        ", now(4)" +
        ", " +
        programID +
        ")";
      db.query(sql, (err, reslt) => {
        if (err) {
          return res.status(500).json(err);
        }
        let message =
          req.user.email + " Created a New Cycle " + "'" + cycleName + "'";
        let activitySql =
          "INSERT INTO COORDINATOR_ACTIVITY (corActivity,corActivityTime,programID) VALUES (" +
          db.escape(message) +
          "," +
          "now(4)," +
          db.escape(programID) +
          ")";
        db.query(activitySql, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          return res.status(200).json({ cycleName });
        });
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
    let programID = req.user.programID;
    let sql =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE programID=" +
      db.escape(programID) +
      " ORDER BY startDate DESC";
    let cycles = [];

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        cycleInfo = {
          cycleName: row.cycleTitle,
          dateCreated: row.startDate,
          endDate: row.endDate,
          isClosed: row.endDate ? true : false,
          cycleID: row.cycleID
        };
        cycles.push(cycleInfo);
      });
      res.status(200).json({ cycles });
    });
  }
);

// @route GET api/cycles/migrate
// @desc Migrates contents of selected cycle into new cycle
// @access Private
router.post(
  "/migrate",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = {};

    if (isEmpty(req.body.oldCycleID)) {
      errors.noCycleSelected = "Please select a cycle to migrate from!";
      return res.status(404).json(errors);
    }
    if (isEmpty(req.body.cycleName)) {
      errors.emptyCycleName = "Cycle Name Field Cannot be Empty";
      return res.status(404).json(errors);
    }
    let cycleName = req.body.cycleName;
    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleTitle=" + db.escape(cycleName);
    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length > 0) {
        errors.alreadyExistingCycle = "Cycle with this name already exists!";
        return res.status(404).json(errors);
      }
      sql0 =
        "INSERT INTO ASSESSMENT_CYCLE (cycleTitle, startDate, programID) VALUES (" +
        db.escape(cycleName) +
        ", now(4)" +
        // db.escape(new Date()) +
        ", " +
        db.escape(req.user.programID) +
        ")";
      db.query(sql0, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        let oldCycleID = req.body.oldCycleID;
        let newCycleID = result.insertId;
        let programID = req.user.programID;
        let sql =
          "SELECT * FROM LEARNING_OUTCOME WHERE cycleID=" +
          db.escape(oldCycleID);
        db.query(sql, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          let outcomes = [];
          result.forEach(row => {
            outcomes.push({
              learnDesc: row.learnDesc,
              oldOutcomeID: row.learnID
            });
          });

          async.forEachOf(
            outcomes,
            (value, key, callback) => {
              let sql1 =
                "INSERT INTO LEARNING_OUTCOME (learnDesc, programID, cycleID, learnCreatedTime) VALUES (" +
                db.escape(value.learnDesc) +
                ", " +
                db.escape(programID) +
                ", " +
                db.escape(newCycleID) +
                ", " +
                //db.escape(moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")) +
                "now(4))";
              db.query(sql1, (err, result) => {
                if (err) {
                  return callback(err);
                } else {
                  let outcomeID = result.insertId;
                  let measures = [];
                  let outcomeCourses = [];
                  let sql2 =
                    "SELECT * FROM PERFORMANCE_MEASURE WHERE learnID=" +
                    db.escape(value.oldOutcomeID);
                  db.query(sql2, (err, result) => {
                    if (err) {
                      return callback(err);
                    }
                    result.forEach(row => {
                      measures.push([
                        row.measureDesc,
                        row.projectedResult,
                        row.projectedStudentsValue,
                        row.courseAssociated,
                        row.studentNumberScale,
                        row.projectedValueScale,
                        row.toolType,
                        row.toolName,
                        programID,
                        outcomeID,
                        newCycleID,
                        row.toolID
                      ]);
                    });
                    let sql3 =
                      "SELECT * FROM OUTCOME_COURSE WHERE learnID=" +
                      db.escape(value.oldOutcomeID);
                    db.query(sql3, (err, result) => {
                      if (err) {
                        return callback(err);
                      }
                      result.forEach(row => {
                        outcomeCourses.push([row.courseCode, outcomeID]);
                      });

                      let sql4 =
                        "INSERT INTO PERFORMANCE_MEASURE (measureDesc,projectedResult,projectedStudentsValue,courseAssociated,studentNumberScale,projectedValueScale,toolType,toolName,programID,learnID,cycleID,toolID) VALUES ?";
                      if (measures.length > 0) {
                        db.query(sql4, [measures], (err, result) => {
                          if (err) {
                            return callback(err);
                          }
                        });
                      }
                      let sql5 =
                        "INSERT INTO OUTCOME_COURSE (courseCode,learnID) VALUES ?";
                      if (outcomeCourses.length > 0) {
                        db.query(sql5, [outcomeCourses], (err, result) => {
                          if (err) {
                            return callback(err);
                          }
                          callback();
                        });
                      } else {
                        callback();
                      }
                    });
                  });
                }
              });
            },
            err => {
              if (err) {
                return res.status(500).json(err);
              }
              let message =
                req.user.email + " Created a New Cycle '" + cycleName + "'";
              let activitySql =
                "INSERT INTO COORDINATOR_ACTIVITY (corActivity,corActivityTime,programID) VALUES (" +
                db.escape(message) +
                ", now(4)," +
                db.escape(req.user.programID) +
                ")";
              db.query(activitySql, (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                }
                res.status(200).json("Migration Successful!");
              });
            }
          );
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
    let programID = req.user.programID;
    let cycleName = req.body.cycleTitle;
    created = db.escape(new Date());

    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND programID=" +
      db.escape(programID);

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
    let programID = req.user.programID;
    let errors = {};
    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND programID=" +
      db.escape(programID);

    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors = "The given cycle doesn't with cycleID " + cycleID + " exists";
        return res.status(404).json({ errors });
      }
      cycleName = result[0].cycleTitle;
      let sql1 =
        "SELECT * FROM LEARNING_OUTCOME WHERE cycleID=" + db.escape(cycleID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        if (result.length > 0) {
          errors.outcomeExistingInsideCycle =
            "One or more outcomes is linked with this cycle. Please delete outcomes linked with the cycle first!";
          return res.status(404).json(errors);
        }

        let sql2 =
          "DELETE FROM ASSESSMENT_CYCLE WHERE cycleID=" +
          db.escape(cycleID) +
          " AND programID=" +
          db.escape(programID);

        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          let message = req.user.email + " Deleted Cycle '" + cycleName + "'";
          let activitySql =
            "INSERT INTO COORDINATOR_ACTIVITY (corActivity,corActivityTime,programID) VALUES (" +
            db.escape(message) +
            ", now(4)," +
            db.escape(programID) +
            ")";
          db.query(activitySql, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }
            return res.status(200).json({ cycleID, cycleName });
          });
        });
      });
    });
  }
);

// @route POST api/cycles/closeCycle
// @desc Close a cycle
// @access Private
router.post(
  "/closeCycle",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let cycleID = req.body.cycleID;
    let errors = {};
    let sql =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" + db.escape(cycleID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.message = "Cycle Does not Exist";
        return res.status(404).json(errors);
      }
      let cycleName = result[0].cycleTitle;
      let sql1 =
        "UPDATE ASSESSMENT_CYCLE SET endDate=now(4) WHERE cycleID=" +
        db.escape(cycleID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        let sql2 =
          "SELECT * FROM PERFORMANCE_MEASURE NATURAL JOIN LEARNING_OUTCOME NATURAL JOIN ASSESSMENT_CYCLE WHERE cycleID=" +
          db.escape(cycleID);
        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          async.forEachOf(
            result,
            (value, key, callback) => {
              let sql3 =
                "DELETE FROM EVALUATOR_ASSIGN WHERE measureID=" +
                db.escape(value.measureID);
              db.query(sql3, (err, result) => {
                if (err) {
                  callback(err);
                }
                callback();
              });
            },
            err => {
              if (err) {
                return res.status(500).json(err);
              }
              let message = req.user.email + " Closed Cycle " + cycleName;
              let activitySql =
                "INSERT INTO COORDINATOR_ACTIVITY (corActivity,corActivityTime,programID) VALUES (" +
                db.escape(message) +
                ", now(4)," +
                db.escape(req.user.programID) +
                ")";
              db.query(activitySql, (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                }
                return res.status(200).json("Cycle Successfully Closed!");
              });
            }
          );
        });
      });
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
    let programID = req.user.programID;
    let cycleIdentifier = req.params.cycleIdentifier;
    let outcomes = [];

    let sql =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID = " +
      db.escape(cycleIdentifier) +
      " AND programID = " +
      db.escape(programID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json({
          errors: "Cycle with cycle ID " + cycleIdentifier + " Does not Exist!"
        });
      }
      let cycleName = result[0].cycleTitle;
      let isClosed = result[0].endDate ? true : false;
      let sql1 =
        "SELECT * FROM LEARNING_OUTCOME" +
        " WHERE cycleID=" +
        db.escape(cycleIdentifier) +
        " AND programID=" +
        db.escape(programID) +
        " ORDER BY learnCreatedTime";
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        async.forEachOf(
          result,
          (value, key, callback) => {
            let outcomeStatus = "pending";
            let sql2 =
              "SELECT * FROM PERFORMANCE_MEASURE WHERE learnID=" +
              db.escape(value.learnID);
            db.query(sql2, (err, result) => {
              if (err) {
                callback(err);
              }
              result.forEach(row => {
                if (row.evalCount > 0 && row.measureStatus) {
                  outcomeStatus = "passing";
                } else if (row.evalCount > 0 && !row.measureStatus) {
                  outcomeStatus = "failing";
                  return;
                }
              });

              outcome = {
                outcomeName: value.learnDesc,
                outcomeID: value.learnID,
                displayIndex: key + 1,
                outcomeStatus
              };

              outcomes.push(outcome);
              callback();
            });
          },
          err => {
            if (err) {
              return res.status(500).json(err);
            }
            res
              .status(200)
              .json({ outcomes, cycleIdentifier, cycleName, isClosed });
          }
        );
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
    let programID = req.user.programID;
    let outcomeName = req.body.outcomeDescription;

    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND programID=" +
      db.escape(programID);
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
        " AND programID=" +
        db.escape(programID);
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
          "INSERT INTO LEARNING_OUTCOME (cycleID, learnDesc, programID,learnCreatedTime) VALUES (" +
          db.escape(cycleID) +
          ", " +
          db.escape(outcomeName) +
          ", " +
          db.escape(programID) +
          ", " +
          //+ //db.escape(moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")) +
          "now(4))";

        db.query(sql, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          let outcomeID = result.insertId;
          res.status(200).json({ cycleID, outcomeID, programID, outcomeName });
        });
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
    let programID = req.user.programID;
    let outcomeName = req.body.outcomeDescription;

    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND programID=" +
      db.escape(programID);

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
        " AND programID=" +
        db.escape(programID);
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (result.length <= 0) {
          errors.outcomeDescription =
            "The Selected Outcome is not in the current Assessment Cycle";
          return res.status(404).json({ errors });
        }

        let sql2 =
          "UPDATE LEARNING_OUTCOME SET learnDesc=" +
          db.escape(outcomeName) +
          "WHERE cycleID=" +
          db.escape(cycleID) +
          " AND learnID=" +
          db.escape(learnID) +
          " AND programID=" +
          db.escape(programID);

        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.status(200).json({ cycleID, learnID, programID, outcomeName });
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
    let programID = req.user.programID;
    let errors = {};

    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND programID=" +
      db.escape(programID);

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
        " AND programID=" +
        db.escape(programID);
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (result.length <= 0) {
          errors =
            "The Selected Outcome is not in the current Assessment Cycle";
          return res.status(404).json({ errors });
        }
        let outcomeName = result[0].learnDesc;
        let sql1 =
          "SELECT * FROM PERFORMANCE_MEASURE WHERE learnID=" +
          db.escape(learnID);
        db.query(sql1, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          if (result.length > 0) {
            errors.measureExistingInsideOutcome =
              "One or more measures is linked with this this outcome. Please delete measures linked with the outcome first!";
            return res.status(404).json(errors);
          }
          let sql2 =
            "DELETE FROM LEARNING_OUTCOME WHERE cycleID=" +
            db.escape(cycleID) +
            " AND learnID=" +
            db.escape(learnID) +
            " AND programID=" +
            db.escape(programID);

          db.query(sql2, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }

            res.status(200).json({ cycleID, learnID, programID, outcomeName });
          });
        });
      });
    });
  }
);

// @route GET api/cycles/:cycleIdentifier/:outcomeIdentifier
// @desc Retrieves all measures and curriculam associated with the given cycle and outcome
// @access Private

router.get(
  "/:cycleIdentifier/:outcomeIdentifier/measures",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let cycleID = req.params.cycleIdentifier;
    let outcomeID = req.params.outcomeIdentifier;
    let programID = req.user.programID;

    let measures = [];
    let outcomeCourses = [];

    let sql1 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND programID=" +
      db.escape(programID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json({
          errors: "Cycle with ID " + cycleID + " Does not Exist!"
        });
      }
      let isClosed = result[0].endDate ? true : false;

      let sql2 =
        "SELECT * FROM LEARNING_OUTCOME WHERE learnID=" +
        db.escape(outcomeID) +
        " AND programID=" +
        db.escape(programID);
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
        let outcomeStatus = "pending";

        let sql3 =
          "SELECT * FROM PERFORMANCE_MEASURE WHERE learnID=" +
          db.escape(outcomeID) +
          " AND programID=" +
          db.escape(programID) +
          " ORDER BY measureCreatedTime";

        db.query(sql3, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          let indexCount = 1;
          result.forEach(row => {
            measure = {
              measureName: row.measureDesc,
              measureID: row.measureID,
              projectedResult: row.projectedResult,
              projectedStudentNumber: row.projectedStudentsValue,
              courseAssociated: row.courseAssociated,
              studentNumberScale: row.studentNumberScale,
              projectedValueScale: row.projectedValueScale,
              toolName: row.toolName,
              toolID: row.toolID,
              measureStatus: row.measureStatus,
              evalCount: row.evalCount,
              successCount: row.successCount,
              displayIndex: indexCount
            };
            indexCount++;
            measures.push(measure);
            if (row.evalCount > 0 && row.measureStatus) {
              outcomeStatus = "passing";
            } else if (row.evalCount > 0 && !row.measureStatus) {
              outcomeStatus = "failing";
              return;
            }
          });
          let sql4 =
            "SELECT * FROM OUTCOME_COURSE WHERE learnID=" +
            db.escape(outcomeID);
          db.query(sql4, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }
            result.forEach(row => {
              outcomeCourses.push({
                courseCode: row.courseCode,
                courseID: row.courseID
              });
            });
            res.status(200).json({
              measures,
              outcomeCourses,
              cycleID,
              outcomeID,
              outcomeName,
              isClosed,
              outcomeStatus
            });
          });
        });
      });
    });
  }
);

// @route POST api/cycles/:outcomeIdentifier/addNewCourse
// @desc Adds a new curriculam mapping to outcome
// @access Private
router.post(
  "/:outcomeIdentifier/addNewCourse",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = {};
    if (isEmpty(req.body.courseCode)) {
      errors.emptyCourseCode = "Course Code Field Cannot be Empty";
      return res.status(404).json(errors);
    }
    let courseCode = req.body.courseCode.trim();

    let sql =
      "SELECT * FROM LEARNING_OUTCOME WHERE learnID=" +
      db.escape(req.params.outcomeIdentifier);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.nonExistantOutcome = "Outcome Does not Exist";
        return res.status(404).json(errors);
      }
      sql =
        "SELECT * FROM OUTCOME_COURSE WHERE courseCode = " +
        db.escape(courseCode) +
        " AND learnID=" +
        db.escape(req.params.outcomeIdentifier);
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } else if (result.length > 0) {
          errors.alreadyExisitingCourse =
            "This course is already mapped with this outcome";
          return res.status(404).json(errors);
        }
        let sql1 =
          "INSERT INTO OUTCOME_COURSE (courseCode,learnID) VALUES (" +
          db.escape(courseCode) +
          ", " +
          db.escape(req.params.outcomeIdentifier) +
          ")";
        db.query(sql1, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          res.status(200).json("Course Successfully Added to Outcome");
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
    let programID = req.user.programID;

    let projectedStudentNumber = req.body.projectedStudentNumber;
    let course = req.body.course;
    let toolType = req.body.toolType;
    let toolName = req.body.toolTitle;
    let scoreOrPass = req.body.scoreOrPass;
    let studentNumberOperator = req.body.studentNumberOperator;
    let projectedValue = null;
    let valueOperator = null;

    if (scoreOrPass.toLowerCase() !== "pass") {
      projectedValue = req.body.projectedValue;
      valueOperator = req.body.valueOperator;
    }

    let toolID = req.body.toolID;

    let measureName =
      "At least " +
      projectedStudentNumber +
      " " +
      studentNumberOperator +
      " Of Students ";

    measureName =
      course !== ""
        ? measureName + " in Class " + course + " will "
        : measureName + " will ";
    measureName =
      scoreOrPass.toLowerCase() !== "pass" && toolType.toLowerCase() === "test"
        ? measureName +
          " Score " +
          projectedValue +
          " " +
          valueOperator +
          " Or Greater In "
        : scoreOrPass.toLowerCase() !== "pass" &&
          toolType.toLowerCase() === "rubric"
        ? measureName +
          " Score " +
          req.body.scaleDesc +
          " " +
          valueOperator +
          " Or Greater In "
        : measureName + " Pass In ";
    measureName = measureName + toolName + " " + toolType;

    let sql1 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND programID=" +
      db.escape(programID);
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
        " AND programID=" +
        db.escape(programID);
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
          " AND programID=" +
          db.escape(programID);

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
                "INSERT INTO PERFORMANCE_MEASURE(learnID, cycleID, measureDesc, projectedResult, projectedStudentsValue, courseAssociated, programID, toolID,toolName, toolType, studentNumberScale,projectedValueScale,measureCreatedTime) VALUES (" +
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
                db.escape(programID) +
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
                ", " +
                //db.escape(moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")) +
                "now(4))";

              db.query(sql4, (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                }
                let measureID = result.insertId;
                res.status(200).json({
                  cycleID,
                  outcomeID,
                  measureID,
                  programID,
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
                "INSERT INTO TOOL (toolType,programID) VALUES (" +
                db.escape(toolType) +
                ", " +
                db.escape(programID) +
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

// @route POST api/cycles/:measureIdentifier/Update
// @desc Updates a measure of existing assessment Cycle
// @access Private
router.post(
  "/:cycleIdentifier/:outcomeIdentifier/:measureIdentifier/update",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = {};
    let measureID = req.params.measureIdentifier;
    let evalCount = 0;
    let passingCount = 0;
    if (isEmpty(req.body.projectedStudentNumber)) {
      errors.emptyThresholdStudentNumber =
        "Student Threshold number cannot be empty";
      return res.status(404).json(errors);
    } else if (
      !Validator.isFloat(req.body.projectedStudentNumber, { min: 0, max: 100 })
    ) {
      errors.StudentThresholdNotANumber =
        "Student Threhold value should be a number between 0 and 100";
      return res.status(404).json(errors);
    }

    let projectedStudentNumber = parseFloat(req.body.projectedStudentNumber);
    let projectedResult = req.body.projectedResult;

    let sql1 =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.measureNotFound = "Measure with the ID not found!";
        return res.status(404).json(errors);
      }
      let studentNumberScale = result[0].studentNumberScale;
      let courseAssociated = result[0].courseAssociated;
      let toolType = result[0].toolType;
      let toolName = result[0].toolName;
      let oldprojectedResult = result[0].projectedResult;
      let projectedValueScale = result[0].projectedValueScale;

      let updateMeasure = (passingStudentsNumber, msrStatus) => {
        let measureName =
          "At least " +
          projectedStudentNumber +
          " " +
          studentNumberScale +
          " Of Students ";

        measureName = courseAssociated
          ? measureName + " in Class " + courseAssociated + " Will "
          : measureName + " Will ";
        measureName = oldprojectedResult
          ? measureName +
            " Score " +
            projectedResult +
            " " +
            projectedValueScale +
            " Or Greater In "
          : measureName + " Pass In ";
        measureName = measureName + toolName + " " + toolType;

        let sql4 = !isEmpty(oldprojectedResult)
          ? "UPDATE PERFORMANCE_MEASURE SET projectedStudentsValue=" +
            db.escape(projectedStudentNumber) +
            ", projectedResult=" +
            db.escape(projectedResult) +
            ", successCount=" +
            db.escape(passingStudentsNumber)
          : "UPDATE PERFORMANCE_MEASURE SET projectedStudentsValue=" +
            db.escape(projectedStudentNumber);
        sql4 =
          sql4 +
          ", measureDesc=" +
          db.escape(measureName) +
          ", measureStatus=" +
          db.escape(msrStatus) +
          " WHERE measureID=" +
          db.escape(measureID);
        db.query(sql4, (err, result) => {
          if (err) {
            return res.status(500).json();
          }
          res.status(200).json("Updated Successfully!");
        });
      };

      if (result[0].projectedResult) {
        if (isEmpty(projectedResult)) {
          errors.emptyProjectedScore = "Projected Score Cannot be Empty";
          return res.status(404).json(errors);
        } else if (!Validator.isFloat(projectedResult, { min: 0, max: 100 })) {
          errors.thresholdScoreNotANumber =
            "Threshold score value should be a number between 0 and 100";
          return res.status(404).json(errors);
        } else {
          projectedResult = parseFloat(projectedResult);
          if (result[0].toolType.toLowerCase() === "rubric") {
            let sql2 =
              "SELECT * FROM STUDENT_AVERAGE_SCORE WHERE measureID=" +
              db.escape(measureID);
            db.query(sql2, (err, result) => {
              if (err) {
                return res.status(500).json(err);
              }
              result.forEach(row => {
                evalCount++;
                if (row.averageScore >= projectedResult) {
                  passingCount++;
                }
              });
              let isPassing =
                evalCount === 0 ||
                (passingCount / evalCount) * 100 < projectedStudentNumber
                  ? false
                  : true;
              updateMeasure(passingCount, isPassing);
            });
          } else if (result[0].toolType.toLowerCase() === "test") {
            let sql2 =
              "SELECT * FROM TEST_SCORE WHERE measureID=" +
              db.escape(measureID);
            db.query(sql2, (err, result) => {
              if (err) {
                return res.status(500).json(err);
              }
              async.forEachOf(
                result,
                (value, key, callback) => {
                  let testStatus = false;
                  if (value.testScoreStatus !== null) {
                    evalCount++;
                    if (value.testScore >= projectedResult) {
                      passingCount++;
                      testStatus = true;
                    }
                    let sql3 =
                      "UPDATE TEST_SCORE SET testScoreStatus=" +
                      db.escape(testStatus) +
                      " WHERE measureID=" +
                      db.escape(measureID) +
                      " AND studentID=" +
                      db.escape(value.studentID);
                    db.query(sql3, (err, result) => {
                      if (err) {
                        return callback(err);
                      }
                      callback();
                    });
                  }
                },
                err => {
                  if (err) {
                    return res.status(500).json(err);
                  }
                  updateMeasure(
                    passingCount,
                    evalCount !== 0 &&
                      (passingCount / evalCount) * 100 >= projectedStudentNumber
                  );
                }
              );
            });
          }
        }
      } else {
        updateMeasure(
          null,
          result[0].evalCount !== 0 &&
            (result[0].successCount / result[0].evalCount) * 100 >=
              projectedStudentNumber
        );
      }
    });
  }
);

// @route POST api/cycles/:cycleIdentifier/:outcomeIdentifier/:measureIdentifier/Delete"
// @desc DELETE a measure of existing assessment Cycle
// @access Private BIKASH
router.post(
  "/:cycleIdentifier/:outcomeIdentifier/:measureIdentifier/Delete",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let cycleID = req.params.cycleIdentifier;
    let learnID = req.params.outcomeIdentifier;
    let measureID = req.params.measureIdentifier;
    //console.log(measureID);
    let programID = req.user.programID;

    let sql0 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND programID=" +
      db.escape(programID);

    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors = "Cycle with cycle ID " + cycleID + " Does not Exist!";
        return res.status(404).json({ errors });
      }

      let sql1 =
        "SELECT * FROM LEARNING_OUTCOME WHERE cycleID=" +
        db.escape(cycleID) +
        " AND learnID=" +
        db.escape(learnID) +
        " AND programID=" +
        db.escape(programID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (result.length <= 0) {
          errors =
            "The Selected Outcome is not in the current Assessment Cycle";
          return res.status(404).json({ errors });
        }

        let sql2 =
          "SELECT * FROM PERFORMANCE_MEASURE WHERE cycleID=" +
          db.escape(cycleID) +
          " AND learnID=" +
          db.escape(learnID) +
          " AND programID=" +
          db.escape(programID) +
          " AND  measureID=" +
          db.escape(measureID);

        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          if (result.length <= 0) {
            errors =
              "The Selected measure is not in the current Assessment Cycle";
            return res.status(404).json({ errors });
          }
          let sql3 =
            "DELETE FROM PERFORMANCE_MEASURE WHERE cycleID=" +
            db.escape(cycleID) +
            " AND learnID=" +
            db.escape(learnID) +
            " AND programID=" +
            db.escape(programID) +
            " AND measureID=" +
            db.escape(measureID);

          let measureDetails = result[0].measureDesc;
          db.query(sql3, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }

            res
              .status(200)
              .json({ cycleID, learnID, programID, measureID, measureDetails });
          });
        });
      });
    });
  }
);

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
    let programID = req.user.programID;
    let sql1 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" +
      db.escape(cycleID) +
      " AND programID=" +
      db.escape(programID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json({
          errors: "Cycle with ID " + cycleID + " Does not Exist!"
        });
      }
      let isClosed = result[0].endDate ? true : false;

      let sql2 =
        "SELECT * FROM LEARNING_OUTCOME WHERE learnID=" +
        db.escape(outcomeID) +
        " AND programID=" +
        db.escape(programID);
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
          "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
          db.escape(measureID) +
          " AND learnID=" +
          db.escape(outcomeID) +
          " AND cycleID=" +
          db.escape(cycleID);
        db.query(sql3, (err, result) => {
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
            toolID: result[0].toolID,
            testType: result[0].testType,
            isClosed,
            status: result[0].measureStatus,
            evalCount: result[0].evalCount,
            successCount: result[0].successCount
          });
        });
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
        "SELECT * FROM EVALUATOR WHERE isActive=true AND evalEmail=" +
        db.escape(evaluatorEmail);
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
      "SELECT * FROM MEASURE_EVALUATOR NATURAL JOIN EVALUATOR WHERE isActive=true AND measureID=" +
      db.escape(measureID);

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        if (row.evalName != "") {
          evalInfo = {
            measureEvalID: row.measureEvalID,
            evalID: row.evalID,
            name: row.evalFirstName + " " + row.evalLastName,
            email: row.evalEmail
          };
          evaluators.push(evalInfo);
        }
      });
      res.status(200).json({ evaluators });
    });
  }
);

// @route POST api/cycles/:measureIdentifier/deleteMeasureEvaluator
// @desc Deletes Measure Evaluator
// @access Private
router.post(
  "/:measureIdentifier/deleteMeasureEvaluator",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = {};
    let measureID = req.params.measureIdentifier;
    let measureEvalID = req.body.measureEvalID;

    let sql1 =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.measureNotFound = "Measure with the id not found!";
        return res.status(404).json(errors);
      }
      let toolType = result[0].toolType;
      let sql2 =
        "SELECT * FROM MEASURE_EVALUATOR WHERE measureEvalID=" +
        db.escape(measureEvalID);
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        if (result.length <= 0) {
          errors.evaluatorNotFound =
            "Evaluator is not associated with this  measure!";
          return res.status(404).json(errors);
        }
        let evalID = result[0].evalID;
        let sql3 =
          "DELETE FROM MEASURE_EVALUATOR WHERE measureEvalID=" +
          db.escape(measureEvalID);
        db.query(sql3, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          if (toolType.toLowerCase() === "test") {
            let sql4 =
              "DELETE FROM TEST_SCORE WHERE evalID=" +
              db.escape(evalID) +
              " AND testScoreStatus is NULL";
            db.query(sql4, (err, result) => {
              if (err) {
                return res.status(500).json(err);
              }
              return res.status(200).json("Deleted Successfully!");
            });
          } else if (toolType.toLowerCase() === "rubric") {
            let sql4 =
              "DELETE EVALUATE FROM  EVALUATE NATURAL LEFT JOIN RUBRIC_SCORE WHERE evalID=" +
              db.escape(evalID) +
              " AND rubricScore is NULL";
            db.query(sql4, (err, result) => {
              if (err) {
                return res.status(500).json(err);
              }
              return res.status(200).json("Deleted Successfully!");
            });
          }
        });
      });
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
                    if (existingStudents.has(row[2])) {
                      existingStudentsInFile.push(row[2]);
                      return false;
                    } else {
                      existingStudents.add(row[2]);
                      return true;
                    }
                  }
                });
                //console.log(newArray.length);
                //console.log("Gets Here");
                let sql3 =
                  "INSERT INTO STUDENT (studentFirstName,studentLastName,studentEmail,studentCWID,measureID) VALUES ?";
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
    let students = [
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.CWID
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
        const validationError = validateCSVStudentsRow(students);
        if (validationError) {
          errors.validationError = validationError;
          return res.status(404).json(errors);
        } else {
          let firstName = req.body.firstName;
          let lastName = req.body.lastName;
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
                "INSERT INTO STUDENT (studentFirstName, studentLastName, studentEmail,studentCWID, measureID) VALUES (" +
                db.escape(firstName) +
                ", " +
                db.escape(lastName) +
                ", " +
                db.escape(email) +
                ", " +
                db.escape(CWID) +
                ", " +
                db.escape(measureID) +
                ")";
              db.query(sql3, (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                }
                res.status(200).json({
                  name: firstName + " " + lastName,
                  email,
                  CWID,
                  measureID,
                  adminID: req.user.id,
                  programID: req.user.programID
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
            name: row.studentFirstName + " " + row.studentLastName,
            lastName: row.studentLastName,
            firstName: row.studentFirstName,
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

// @route POST api/cycles/:measureIdentifier/updateStudent
// @desc Updates Student Info
// @access Private

router.post(
  ":/measureIdentifier/updateStudent",
  passport.authenticate("jwt", { sesion: false }),
  (req, res) => {
    let errors = {};
    let measureID = req.params.measureIdentifier;
    let studentID = req.body.studentID;
    let CWID = "";
    if (isEmpty(req.body.firstName)) {
      errors.emptyFirstName = "First Name field cannot be Empty";
    }
    if (isEmpty(req.body.lastName)) {
      errors.lastName = "Last Name field cannot be Empty";
    }

    if (isEmpty(req.body.studentEmail)) {
      errors.studentEmail = "Email field cannot be empty";
    }
    if (!isEmpty(req.body.studentCWID)) {
      CWID = req.body.studentCWID;
    }
    if (!isEmpty(errors)) {
      return res.status(404).json(errors);
    }

    let sql1 =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.measureNotExisiting = "Measure Does not Exist!";
        return res.status(404).json(errors);
      }
      let sql2 =
        "SELECT * FROM STUDENT WHERE studentID=" + db.escape(studentID);
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        if (result.length <= 0) {
          errors.nonExistingStudent = "Student Does not Exist!";
          return res.status(404).json(errors);
        }
        let sql3 =
          "UPDATE STUDENT SET studentFirstName=" +
          db.escape(req.body.firstName) +
          ", studentLastName=" +
          db.escape(lastName) +
          ", studentEmail=" +
          db.escape(studentEmail) +
          ", studentCWID=" +
          db.escape(CWID) +
          " WHERE studentID=" +
          db.escape(studentID);
        db.query(sql3, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          res.status(200).json("Updated Successfully!");
        });
      });
    });
  }
);

// @route POST api/cycles/:measureIdentifier/deleteStudent
// @desc Deletes Student
// @access Private
router.post(
  "/:measureIdentifier/deleteStudent",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = {};
    let measureID = req.params.measureIdentifier;
    let deleteStudentID = req.body.studentID;

    let sql1 =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.measureNotFound = "Measure with the id not found!";
        return res.status(404).json(errors);
      }
      let projectedResult = result[0].projectedResult;
      let thresholdStudents = result[0].projectedStudentsValue;
      let toolType = result[0].toolType;
      let sql2 =
        "SELECT * FROM STUDENT WHERE studentID=" + db.escape(deleteStudentID);
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        if (result.length <= 0) {
          errors.studentNotFound = "Selected Student Does Not Exist";
          return res.status(404).json(errors);
        }
        let sql3 =
          "DELETE FROM STUDENT WHERE studentID=" + db.escape(deleteStudentID);
        db.query(sql3, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          let sql9 = "SELECT * FROM ";
          sql9 =
            toolType.toLowerCase() === "rubric"
              ? sql9 +
                "STUDENT_AVERAGE_SCORE where measureID=" +
                db.escape(measureID)
              : sql9 + "TEST_SCORE where measureID=" + db.escape(measureID);

          db.query(sql9, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }
            let totalCount = 0;
            let passingCount = 0;
            let passing = false;

            result.forEach(row => {
              totalCount++;
              if (toolType.toLowerCase() === "rubric") {
                if (row.averageScore >= projectedResult) {
                  passingCount++;
                }
              } else {
                if (row.testScoreStatus) {
                  passingCount++;
                }
              }
            });
            if (
              totalCount !== 0 &&
              thresholdStudents !== -1 &&
              (passingCount / totalCount) * 100 >= thresholdStudents
            ) {
              passing = true;
            }
            let sql10 =
              "UPDATE PERFORMANCE_MEASURE SET measureStatus=" +
              db.escape(passing) +
              ", evalCount=" +
              db.escape(result.length) +
              ", successCount=" +
              db.escape(passingCount) +
              " WHERE measureID=" +
              db.escape(measureID);
            db.query(sql10, (err, result) => {
              if (err) {
                return res.status(500).json(err);
              }
              return res.status(200).json("Deleted Successfully!");
            });
          });

          //res.status(200).json("Deleted Successfully!");
        });
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
      let toolType = result[0].toolType;
      let sql1 =
        "SELECT * FROM MEASURE_EVALUATOR NATURAL JOIN EVALUATOR NATURAL JOIN STUDENT NATURAL JOIN EVALUATOR_ASSIGN ";
      sql1 =
        result[0].toolType.toLowerCase() === "rubric"
          ? sql1 +
            "NATURAL LEFT JOIN RUBRIC_SCORE WHERE measureID=" +
            db.escape(measureID)
          : sql1 +
            "NATURAL JOIN TEST_SCORE WHERE measureID=" +
            db.escape(measureID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        result.forEach(row => {
          student = {
            name: row.studentFirstName + " " + row.studentLastName,
            email: row.studentEmail,
            CWID: row.studentCWID,
            studentID: row.studentID,
            evalEmail: row.evalEmail,
            evalName: row.evalName,
            measureEvalID: row.measureEvalID
          };
          if (toolType.toLowerCase() === "rubric") {
            if (!row.rubricScore) {
              assignedStudentsList.push(student);
            } else {
              evaluatedStudentsList.push(student);
            }
          } else if (toolType.toLowerCase() === "test") {
            if (row.testScoreStatus === null) {
              assignedStudentsList.push(student);
            } else {
              evaluatedStudentsList.push(student);
            }
          }
        });
        res.status(200).json({ assignedStudentsList, evaluatedStudentsList });
      });
    });
  }
);

// @route POST api/cycles/:measureIdentifier/deleteAssignedStudent
// @desc Deletes Assigned Student
// @access Private
router.post(
  "/:measureIdentifier/deleteAssignedStudent",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = {};
    let measureID = req.params.measureIdentifier;
    let deleteStudentID = req.body.studentID;
    let measureEvalID = req.body.measureEvalID;
    console.log(req.body);
    let sql1 =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE measureID=" +
      db.escape(measureID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.measureNotFound = "Measure with the id not found!";
        return res.status(404).json(errors);
      }
      let toolType = result[0].toolType;
      let sql2 =
        "SELECT * FROM STUDENT WHERE studentID=" + db.escape(deleteStudentID);
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        if (result.length <= 0) {
          errors.studentNotFound = "Selected Student Does Not Exist";
          return res.status(404).json(errors);
        }
        let sql3 =
          "SELECT * FROM MEASURE_EVALUATOR WHERE measureEvalID=" +
          db.escape(measureEvalID);
        db.query(sql3, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          if (result.length <= 0) {
            errors.evaluatorNotFound = "Evaluator Does not Exist!";
            return res.status(404).json(errors);
          }
          evalID = result[0].evalID;
          let sql4 =
            "DELETE FROM EVALUATOR_ASSIGN WHERE studentID=" +
            db.escape(deleteStudentID) +
            " AND measureEvalID=" +
            db.escape(measureEvalID);
          db.query(sql4, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }

            if (toolType.toLowerCase() === "rubric") {
              let sql5 =
                "SELECT * FROM EVALUATE NATURAL LEFT JOIN RUBRIC_SCORE WHERE evalID=" +
                db.escape(evalID) +
                " AND studentID=" +
                db.escape(deleteStudentID);
              db.query(sql5, (err, result) => {
                if (err) {
                  return res.status(500).json();
                }
                let del = false;
                result.forEach(row => {
                  if (!row.rubricScore) {
                    del = true;
                    return;
                  }
                });
                if (del) {
                  let sql6 =
                    "DELETE FROM EVALUATE WHERE evalID=" +
                    db.escape(evalID) +
                    " AND studentID=" +
                    db.escape(deleteStudentID);
                  db.query(sql6, (err, result) => {
                    if (err) {
                      return res.status(500).json(err);
                    }
                    return res.status(200).json("Deleted Successfully!");
                  });
                } else {
                  return res.status(200).json("Deleted Successfully!");
                }
              });
            } else {
              let sql5 =
                "SELECT * FROM TEST_SCORE WHERE studentID=" +
                db.escape(deleteStudentID) +
                " AND evalID=" +
                db.escape(evalID);
              db.query(sql5, (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                }

                if (result.length > 0) {
                  if (!result[0].testScoreStatus) {
                    let sql6 =
                      "DELETE FROM TEST_SCORE WHERE studentID=" +
                      db.escape(deleteStudentID) +
                      "AND evalID=" +
                      db.escape(evalID);
                    db.query(sql6, (err, result) => {
                      if (err) {
                        return res.status(500).json(err);
                      }
                      return res.status(200).json("Deleted Successfully!");
                    });
                  } else {
                    return res.status(200).json("Deleted Successfully!");
                  }
                } else {
                  return res.status(200).json("Deleted Successfully!");
                }
              });
            }
          });
        });
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
    let programID = req.user.programID;
    let evalID = req.body.measureEvalID;
    let actualEvalID = req.body.evalID;
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
        let measureName = result[0].measureDesc;
        let toolName = result[0].toolName;
        let toolType = result[0].toolType;
        async.forEachOfSeries(
          req.body.studentIDs,
          (value, key, callback) => {
            let sql1 =
              "SELECT * FROM EVALUATOR_ASSIGN WHERE programID=" +
              db.escape(programID) +
              " AND measureEvalID=" +
              db.escape(evalID) +
              " AND studentID=" +
              db.escape(value.id) +
              " AND toolID=" +
              db.escape(rubricID) +
              " AND measureID=" +
              db.escape(measureID);

            db.query(sql1, (err, result) => {
              if (err) {
                return callback(err);
              } else if (result.length > 0) {
                alreadyAssignedStudents.push({
                  studentEmail: value.email,
                  studentID: value.id,
                  evalID,
                  rubricID
                });
                callback();
              } else {
                tobeAssignedStudents.push([
                  adminID,
                  evalID,
                  value.id,
                  rubricID,
                  measureID,
                  programID
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
                "INSERT INTO EVALUATOR_ASSIGN (corId,measureEvalID,studentID,toolID,measureID,programID) VALUES ?";
              if (tobeAssignedStudents.length > 0) {
                db.query(sql2, [tobeAssignedStudents], (err, result) => {
                  if (err) {
                    return res.status(500).json(err);
                  }
                  let message =
                    req.user.email +
                    " Assigned " +
                    tobeAssignedStudents.length +
                    " Students for Measure '" +
                    measureName +
                    "'";
                  let activitySql =
                    "INSERT INTO COORDINATOR_ACTIVITY (corActivity,corActivityTime,programID) VALUES (" +
                    db.escape(message) +
                    ", now(4)," +
                    db.escape(req.user.programID) +
                    ")";
                  db.query(activitySql, (err, result) => {
                    if (err) {
                      return res.status(500).json(err);
                    }
                    let message1 =
                      "You have been Assigned " +
                      tobeAssignedStudents.length +
                      " Students to Evaluate for '" +
                      toolName +
                      "' " +
                      toolType;
                    let activitySql1 =
                      "INSERT INTO EVALUATOR_ACTIVITY (evalID,evalActivity,evalActivityTime) VALUES (" +
                      db.escape(actualEvalID) +
                      ", " +
                      db.escape(message1) +
                      ", " +
                      "now(4))";
                    db.query(activitySql1, (err, result) => {
                      if (err) {
                        return res.status(500).json(err);
                      }
                      return res.status(200).json({
                        alreadyAssignedStudents,
                        tobeAssignedStudents
                      });
                    });
                  });
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

// @route POST api/cycles/:measureIdentifier/testAssign
// @desc Assign Test and Student to Evaluator for evaluation purpose
// @access private

router.post(
  "/:measureIdentifier/testAssign",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let measureID = req.params.measureIdentifier;
    let adminID = req.user.id;
    let programID = req.user.programID;
    let measureEvalID = req.body.measureEvalID;
    let evalID = req.body.evalID;
    let testID = req.body.testID;
    let measureEvalEmail = req.body.measureEvalEmail;

    alreadyAssignedStudents = [];
    tobeAssignedStudents = [];
    tobeAssignedObjects = [];
    let testScores = [];
    let errors = {};
    console.log(req.body.studentIDs);
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
        let measureName = result[0].measureDesc;
        let toolName = result[0].toolName;
        let toolType = result[0].toolType;
        async.forEachOfSeries(
          req.body.studentIDs,
          (value, key, callback) => {
            let sql1 =
              "SELECT * FROM EVALUATOR_ASSIGN NATURAL JOIN MEASURE_EVALUATOR WHERE programID=" +
              db.escape(programID) +
              " AND evalEmail=" +
              db.escape(measureEvalEmail) +
              " AND studentID=" +
              db.escape(value.id) +
              " AND toolID=" +
              db.escape(testID) +
              " AND measureID=" +
              db.escape(measureID);

            db.query(sql1, (err, result) => {
              if (err) {
                return callback(err);
              } else if (result.length > 0) {
                console.log("Is here");
                alreadyAssignedStudents.push({
                  studentID: value.id,
                  email: value.email,
                  measureEvalID,
                  testID
                });
                callback();
              } else {
                tobeAssignedStudents.push([
                  adminID,
                  measureEvalID,
                  value.id,
                  testID,
                  measureID,
                  programID
                ]);
                let sql00 =
                  "SELECT * FROM TEST_SCORE WHERE testStudentEmail=" +
                  db.escape(value.email) +
                  " AND evalID=" +
                  db.escape(evalID) +
                  " AND measureID=" +
                  db.escape(measureID);
                db.query(sql00, (err, result) => {
                  if (err) {
                    callback(err);
                  } else if (result.length <= 0) {
                    testScores.push([value.id, value.email, evalID, measureID]);
                  }
                  callback();
                });
              }
            });
          },
          err => {
            if (err) {
              return res.status(500).json(err);
            } else {
              let sql2 =
                "INSERT INTO EVALUATOR_ASSIGN (corId,measureEvalID,studentID,toolID,measureID,programID) VALUES ?";
              if (tobeAssignedStudents.length > 0) {
                db.query(sql2, [tobeAssignedStudents], (err, result) => {
                  if (err) {
                    return res.status(500).json(err);
                  }
                  if (testScores.length > 0) {
                    let sql3 =
                      "INSERT INTO TEST_SCORE (studentID, testStudentEmail, evalID, measureID) VALUES ?";
                    db.query(sql3, [testScores], (err, result) => {
                      if (err) {
                        return res.status(500).json(err);
                      }
                      let message =
                        req.user.email +
                        " Assigned " +
                        testScores.length +
                        " Students for Measure '" +
                        measureName +
                        "'";
                      let activitySql =
                        "INSERT INTO COORDINATOR_ACTIVITY (corActivity,corActivityTime,programID) VALUES (" +
                        db.escape(message) +
                        ", now(4)," +
                        db.escape(req.user.programID) +
                        ")";
                      db.query(activitySql, (err, result) => {
                        if (err) {
                          return res.status(500).json(err);
                        }
                        let message1 =
                          "You have been assigned " +
                          testScores.length +
                          " Students to Evaluate for '" +
                          toolName +
                          "' " +
                          toolType;
                        let activitySql1 =
                          "INSERT INTO EVALUATOR_ACTIVITY (evalID,evalActivity,evalActivityTime) VALUES (" +
                          db.escape(evalID) +
                          ", " +
                          db.escape(message1) +
                          ", " +
                          "now(4))";
                        db.query(activitySql1, (err, result) => {
                          if (err) {
                            return res.status(500).json(err);
                          }
                          return res.status(200).json({
                            alreadyAssignedStudents,
                            tobeAssignedStudents
                          });
                        });
                      });
                    });
                  } else {
                    return res
                      .status(200)
                      .json({ alreadyAssignedStudents, tobeAssignedStudents });
                  }
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
      let toolName = result[0].toolName;
      let sql0 =
        "SELECT * FROM RUBRIC NATURAL JOIN CRITERIA WHERE toolID=" +
        db.escape(result[0].toolID) +
        " ORDER BY criteriaID";
      db.query(sql0, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } else if (result.length <= 0) {
          errors.nonExistentCriterias = "Criterias does not exist";
          return res.status(404).json(errors);
        }
        let weightedRubric = 0;

        if (result[0].weighted) {
          weightedRubric = 1;
        }
        let criteriaInfo = [];
        result.forEach(row => {
          if (weightedRubric) {
            criteriaInfo.push({
              criteriaDescription: row.criteriaDesc,
              criteriaWeight: row.criteriaWeight * 100
            });
          } else {
            criteriaInfo.push({ criteriaDescription: row.criteriaDesc });
          }
        });
        //console.log(threshold);
        let sql1 =
          "SELECT * FROM EVALUATE NATURAL JOIN EVALUATOR  NATURAL JOIN PERFORMANCE_MEASURE NATURAL JOIN STUDENT NATURAL JOIN RUBRIC NATURAL JOIN CRITERIA  NATURAL JOIN RUBRIC_SCORE NATURAL JOIN STUDENT_AVERAGE_SCORE WHERE measureID=" +
          db.escape(measureID) +
          " ORDER BY criteriaID,studentID,evalID";
        db.query(sql1, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          let prevCriteria = "";
          let count = 0;

          result.forEach((row, index) => {
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

          // console.log(threshold);
          // console.log(result.length);
          result.forEach((row, index) => {
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
              indResult["studentName"] =
                row.studentLastName + ", " + row.studentFirstName;
              indResult["evalName"] =
                row.evalLastName + ", " + row.evalFirstName;
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
                  Math.round(row.criteriaScore / row.criteriaWeight) >=
                  threshold
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
                  Math.round(row.criteriaScore / row.criteriaWeight) >=
                  threshold
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

          passingCounts["averageScore"] =
            avgtotalStudentCount === 0 ? "" : avgPassingStudentCount;
          passingPercentages["averageScore"] =
            avgtotalStudentCount === 0
              ? 0
              : round((avgPassingStudentCount / avgtotalStudentCount) * 100, 2);

          res.status(200).json({
            criteriaInfo,
            results,
            classAverage,
            passingCounts,
            passingPercentages,
            numberOfEvaluations: count,
            numberOfUniqueStudents: avgtotalStudentCount,
            toolName,
            threshold,
            weightedRubric
          });
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
      let projectedValueScale = result[0].projectedValueScale;
      let sql1 =
        "SELECT * FROM TEST_SCORE NATURAL JOIN STUDENT NATURAL JOIN EVALUATOR WHERE measureID=" +
        db.escape(measureID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        let totalStudents = result.length;
        let passingCounts = 0;
        result.forEach(row => {
          result = {
            evalEmail: row.evalEmail,
            studentName: row.studentLastName + ", " + row.studentFirstName,
            studentEmail: row.studentEmail,
            CWID: row.studentCWID,
            score: row.testScore ? row.testScore : "N/A",
            passing: row.testScoreStatus ? true : false,
            evalName: row.evalLastName + ", " + row.evalFirstName
          };
          if (row.testScoreStatus !== null) {
            report.push(result);
            if (row.testScoreStatus) {
              passingCounts++;
            }
          }
        });
        let passingPercentage = 0;
        if (totalStudents !== 0 && passingCounts !== 0) {
          passingPercentage = Number(
            Math.round((passingCounts / totalStudents) * 100 + "e2") + "e-2"
          );
        } else {
          passingPercentage = 0;
        }
        res.status(200).json({
          report,
          totalStudents,
          passingCounts,
          passingPercentage,
          projectedValueScale
        });
      });
    });
  }
);

router.get(
  "/:cycleIdentifier/cycleSummaryReport",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let cycleID = req.params.cycleIdentifier;
    let errors = {};
    let cycleReport = {};

    let sql1 =
      "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID=" + db.escape(cycleID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length <= 0) {
        errors.cycleNotFound = "Assessment Cycle Does not Exist";
        return res.status(404).json(errors);
      }
      cycleReport.cycleName = result[0].cycleTitle;

      let sql2 =
        "SELECT * FROM LEARNING_OUTCOME WHERE cycleID=" +
        db.escape(cycleID) +
        " ORDER BY learnCreatedTime";
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        async.forEachOf(
          result,
          (value, key, callback) => {
            let outcomeName = key + 1 + ". " + value.learnDesc;
            cycleReport[outcomeName] = {};
            cycleReport[outcomeName]["measureDetails"] = [];

            let outcomeCourses = [];
            let sql3 =
              "SELECT * FROM OUTCOME_COURSE WHERE learnID=" +
              db.escape(value.learnID);
            db.query(sql3, (err, result) => {
              if (err) {
                return callback(err);
              }
              result.forEach(row => {
                outcomeCourses.push(row.courseCode);
              });
              cycleReport[outcomeName].outcomeCourses = outcomeCourses;
              let sql4 =
                "SELECT * FROM PERFORMANCE_MEASURE WHERE learnID=" +
                db.escape(value.learnID) +
                " ORDER BY measureCreatedTime";
              db.query(sql4, (err, result) => {
                if (err) {
                  return callback(err);
                }
                result.forEach((row, indx) => {
                  cycleReport[outcomeName].measureDetails.push({
                    measureDesc: row.measureDesc,
                    measureDisplayID: key + 1 + "." + (indx + 1),
                    evalCount: row.evalCount,
                    successCount: row.successCount,
                    threshold: row.projectedResult
                      ? row.projectedResult + row.projectedValueScale
                      : "pass",
                    measureStatus: row.measureStatus
                  });
                });
                callback();
              });
            });
          },
          err => {
            if (err) {
              return res.status(500).json(err);
            }
            res.status(200).json(cycleReport);
          }
        );
      });
    });
  }
);
module.exports = router;
