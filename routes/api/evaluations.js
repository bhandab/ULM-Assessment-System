const express = require("express");
const passport = require("passport");
const async = require("async");

const db = require("../../config/dbconnection");
const isEmpty = require("../../validation/isEmpty");
const router = express.Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let evalID = req.user.id;
    let errors = {};
    let evaluations = [];

    let sql =
      "SELECT * FROM EVALUATOR_ASSIGN NATURAL JOIN MEASURE_EVALUATOR NATURAL JOIN EVALUATOR NATURAL JOIN STUDENT NATURAL JOIN RUBRIC WHERE evalID=" +
      db.escape(evalID);

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        evalInfo = {
          measureID: row.measureID,
          adminID: row.corId,
          studentID: row.studentID,
          evalEmail: row.evalEmail,
          evalID: row.evalID,
          measureEvalID: row.measureEvalID,
          rubricID: row.toolID,
          evalName: row.evalName,
          studentName: row.studentFirstName + " " + row.studentLastName,
          studentCWID: row.studentCWID,
          studentEmail: row.studentEmail,
          rubricName: row.rubricTitle
        };
        evaluations.push(evalInfo);
      });
      res.status(200).json(evaluations);
    });
  }
);

router.get(
  "/evaluationTools",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let evalID = req.user.id;
    let errors = {};

    let rubrics = [];
    let tests = [];
    let rubricsSet = new Set();
    let testsSet = new Set();

    let sql =
      "SELECT * FROM EVALUATOR_ASSIGN NATURAL JOIN MEASURE_EVALUATOR NATURAL JOIN EVALUATOR NATURAL JOIN TOOL NATURAL JOIN PERFORMANCE_MEASURE WHERE evalID=" +
      db.escape(evalID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        if (row.toolType.toLowerCase() === "rubric") {
          if (!rubricsSet.has(row.toolName)) {
            rubricsSet.add(row.toolName);
            rubrics.push({
              rubricName: row.toolName,
              rubricID: row.toolID,
              measureID: row.measureID
            });
          }
        } else if (row.toolType.toLowerCase() === "test") {
          if (!testsSet.has(row.toolName)) {
            testsSet.add(row.toolName);
            tests.push({
              testName: row.toolName,
              testID: row.toolID,
              measureID: row.measureID,
              projectedResult: row.projectedResult
            });
          }
        }
      });

      res.status(200).json({ rubrics, tests });
    });
  }
);

router.post(
  "/testScores",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let evalID = req.user.id;
    let testID = req.body.testID;
    let scores = [];
    let errors = {};
    let sql =
      "SELECT * FROM TEST_SCORE EVALUATOR_ASSIGN NATURAL JOIN STUDENT NATURAL JOIN MEASURE_EVALUATOR NATURAL JOIN EVALUATOR NATURAL JOIN PERFORMANCE_MEASURE WHERE evalID=" +
      db.escape(evalID) +
      " AND toolID=" +
      db.escape(testID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        scores.push({
          firstName: row.studentFirstName,
          lastName: row.studentLastName,
          email: row.studentEmail,
          CWID: row.studentCWID,
          studentID: row.studentID,
          measureID: row.measureID,
          projectedResult: row.projectedResult,
          testScore: row.testScore,
          testScoreStatus: row.testScoreStatus
        });
      });
      res.status(200).json({ scores, evalID, testID });
    });
  }
);

// @route POST api/evaluations/updateTestScore
// @desc Updates student score
// @access Private
router.post(
  "/updateTestScore",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = {};

    let measureID = req.body.measureID;
    let studentID = req.body.studentID;
    let scoreStatus = req.body.scoreStatus;
    let testScore = req.body.testScore;

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
      let projectedResult = result[0].projectedResult;
      let projectedStudentsValue = result[0].projectedStudentsValue;
      if (!isEmpty(projectedResult)) {
        if (isEmpty(testScore)) {
          return res.status(404).json("Test Score Field Cannot Be Empty");
        }
      }
      let sql1 =
        "SELECT * FROM TEST_SCORE WHERE studentID=" + db.escape(studentID);

      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        if (result.length <= 0) {
          errors.studentNotFound = "Student Does not Exist!";
          return res.status(404).json(errors);
        }
        //let measureEvalID = result[0].measureEvalID;
        let sql2 = !isEmpty(projectedResult)
          ? "UPDATE TEST_SCORE SET testScore=" +
            db.escape(parseFloat(testScore)) +
            ",testScoreStatus=" +
            db.escape(parseFloat(testScore) >= projectedResult)
          : "UPDATE TEST_SCORE SET testScoreStatus=" + db.escape(scoreStatus);

        sql2 =
          sql2 +
          " WHERE studentID=" +
          db.escape(studentID) +
          " AND evalID=" +
          db.escape(req.user.id) +
          " AND measureID=" +
          db.escape(measureID);
        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          let sql3 =
            "SELECT * FROM TEST_SCORE WHERE measureID=" + db.escape(measureID);
          db.query(sql3, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }
            let successCount = 0;
            result.forEach(row => {
              if (row.testScoreStatus) {
                successCount++;
              }
            });
            let measureStatus =
              result.length === 0 ||
              (successCount / result.length) * 100 < projectedStudentsValue
                ? false
                : true;
            let sql5 =
              "UPDATE PERFORMANCE_MEASURE SET measureStatus=" +
              db.escape(measureStatus) +
              ", evalCount=" +
              db.escape(result.length) +
              ", successCount=" +
              db.escape(successCount) +
              " WHERE measureID=" +
              db.escape(measureID);
            db.query(sql5, (err, result) => {
              if (err) {
                return res.status(500).json(err);
              }
            });
            res.status(200).json("Updated Successfully!");
          });
        });
      });
    });
  }
);

router.post(
  "/evaluate",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let evalID = req.user.id;
    let rubricID = req.body.rubricID;
    let measureID = req.body.measureID;
    let studentID = req.body.studentID;
    let measureEvalID = req.body.measureEvalID;
    let evaluatedScores = [];
    let evalInfo = [];
    let criteriaScores = [];
    let sql0 = "SELECT * FROM RUBRIC WHERE toolID=" + db.escape(rubricID);
    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json("Rubric Not Found");
      }
      let weighted = result[0].weighted;
      let sql1 =
        "SELECT * FROM EVALUATE WHERE toolID=" +
        db.escape(rubricID) +
        " AND studentID=" +
        db.escape(studentID) +
        " AND evalID=" +
        db.escape(evalID) +
        " AND measureID=" +
        db.escape(measureID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } else if (result.length > 0) {
          result.forEach(row => {
            let indEval = {
              criteriaID: row.criteriaID,
              criteriaScore: row.criteriaScore
            };
            evalInfo.push(indEval);
          });
          return res.status(200).json(evalInfo);
        } else {
          let sql2 =
            "SELECT * FROM CRITERIA WHERE toolID=" + db.escape(rubricID);
          db.query(sql2, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }
            result.forEach(row => {
              let weight = null;
              if (weighted) {
                weight = row.criteriaWeight;
              }
              let tempCriteria = {
                criteriaWeight: weight,
                criteriaID: row.criteriaID
              };
              criteriaScores.push(tempCriteria);
            });

            criteriaScores.forEach(score => {
              let cScore = 1;
              if (score.criteriaWeight) {
                cScore = cScore * score.criteriaWeight;
              }
              let criteriaScore = [
                rubricID,
                measureID,
                score.criteriaID,
                studentID,
                evalID,
                cScore
              ];
              evaluatedScores.push(criteriaScore);

              let indEval = {
                criteriaID: score.criteriaID,
                criteriaScore: cScore
              };
              evalInfo.push(indEval);
            });

            let sql3 =
              "INSERT INTO EVALUATE (toolID,measureID,criteriaID,studentID,evalID,criteriaScore) VALUES ?";
            db.query(sql3, [evaluatedScores], (err, result) => {
              if (err) {
                return res.status(500).json(err);
              }
              res.status(200).json(evalInfo);
            });
          });
        }
      });
    });
  }
);

router.post(
  "/updateScores",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let rubricID = req.body.rubricID;
    let measureID = req.body.measureID;
    let studentID = req.body.studentID;

    let sql0 = "SELECT * FROM RUBRIC WHERE toolID=" + db.escape(rubricID);

    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json("Rubric Not Found");
      }
      let weighted = result[0].weighted;
      async.forEachOf(
        req.body.criteriaInfo,
        (value, key, callback) => {
          let criteriaID = value.criteriaID;
          let criteriaScore = value.criteriaScore;

          let sql1 =
            "UPDATE EVALUATE SET criteriaScore=" +
            db.escape(parseFloat(criteriaScore)) +
            " WHERE toolID=" +
            db.escape(rubricID) +
            " AND measureID=" +
            db.escape(measureID) +
            " AND criteriaID=" +
            db.escape(criteriaID) +
            " AND studentID=" +
            db.escape(studentID) +
            " AND evalID=" +
            db.escape(req.user.id);
          db.query(sql1, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }
            callback();
          });
        },
        err => {
          if (err) {
            return res.status(500).json(err);
          }
          let sql9 =
            "SELECT * FROM EVALUATE WHERE toolID=" +
            db.escape(rubricID) +
            " AND measureID=" +
            db.escape(measureID) +
            " AND studentID=" +
            db.escape(studentID) +
            " AND evalID=" +
            db.escape(req.user.id);
          db.query(sql9, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }
            let totalScore = 0;
            let count = 0;

            result.forEach(row => {
              totalScore += row.criteriaScore;
              count++;
            });

            let avgScore = Number(Math.round(totalScore + "e2") + "e-2");
            if (!weighted) {
              avgScore = (totalScore / count).toFixed(2);
            }

            let sql2 =
              "SELECT * FROM RUBRIC_SCORE WHERE toolID=" +
              db.escape(rubricID) +
              " AND studentID=" +
              db.escape(studentID) +
              " AND evalID=" +
              db.escape(req.user.id);
            db.query(sql2, (err, result) => {
              if (err) {
                return res.status(500).json(err);
              } else if (result.length > 0) {
                let sql3 =
                  "UPDATE RUBRIC_SCORE SET rubricScore=" +
                  db.escape(avgScore) +
                  " WHERE toolID=" +
                  db.escape(rubricID) +
                  " AND studentID=" +
                  db.escape(studentID) +
                  " AND evalID=" +
                  db.escape(req.user.id);
                db.query(sql3, (err, result) => {
                  if (err) {
                    return res.status(500).json(err);
                  } else {
                    updateMeasureStatus();
                  }
                });
              } else {
                let sql5 =
                  "INSERT INTO RUBRIC_SCORE (toolID,studentID,evalID,rubricScore) VALUES (" +
                  db.escape(rubricID) +
                  ", " +
                  db.escape(studentID) +
                  ", " +
                  db.escape(req.user.id) +
                  ", " +
                  db.escape(avgScore) +
                  ")";
                db.query(sql5, (err, result) => {
                  if (err) {
                    return res.status(500).json(err);
                  }
                  let sql6 =
                    "SELECT * FROM STUDENT_AVERAGE_SCORE WHERE toolID=" +
                    db.escape(rubricID) +
                    " AND studentID=" +
                    db.escape(studentID) +
                    " AND measureID=" +
                    db.escape(measureID);
                  db.query(sql6, (err, result) => {
                    if (err) {
                      return res.status(500).json(err);
                    } else if (result.length <= 0) {
                      let sql7 =
                        "INSERT INTO STUDENT_AVERAGE_SCORE (toolID,studentID,measureID,averageScore) VALUES (" +
                        db.escape(rubricID) +
                        ", " +
                        db.escape(studentID) +
                        ", " +
                        db.escape(measureID) +
                        ", " +
                        db.escape(avgScore) +
                        ")";
                      db.query(sql7, (err, result) => {
                        if (err) {
                          return res.status(500).json(err);
                        }
                        updateMeasureStatus();
                      });
                    } else {
                      updateMeasureStatus();
                    }
                  });
                });
              }

              let updateMeasureStatus = () => {
                let sql4 =
                  "SELECT AVG(rubricScore) as averageStudentScore FROM RUBRIC_SCORE WHERE toolID=" +
                  db.escape(rubricID) +
                  " AND studentID=" +
                  db.escape(studentID);
                db.query(sql4, (err, result) => {
                  if (err) {
                    return res.status(500).json(err);
                  }

                  let averageStudentScore = result[0].averageStudentScore.toFixed(
                    2
                  );

                  let sql8 =
                    "UPDATE STUDENT_AVERAGE_SCORE SET averageScore=" +
                    db.escape(averageStudentScore) +
                    " WHERE toolID=" +
                    db.escape(rubricID) +
                    " AND studentID=" +
                    db.escape(studentID) +
                    " AND measureID=" +
                    db.escape(measureID);
                  db.query(sql8, (err, result) => {
                    if (err) {
                      return res.status(500).json(err);
                    }
                    let sql9 =
                      "SELECT * FROM PERFORMANCE_MEASURE NATURAL JOIN STUDENT_AVERAGE_SCORE where measureID=" +
                      db.escape(req.body.measureID);

                    db.query(sql9, (err, result) => {
                      if (err) {
                        return res.status(500).json(err);
                      }

                      let totalCount = 0;
                      let passingCount = 0;
                      var thresholdStudents = -1;
                      let passing = false;
                      result.forEach(row => {
                        thresholdStudents = row.projectedStudentsValue;
                        totalCount++;
                        if (row.averageScore >= row.projectedResult) {
                          passingCount++;
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
                        db.escape(req.body.measureID);
                      db.query(sql10, (err, result) => {
                        if (err) {
                          return res.status(500).json(err);
                        }
                        return res
                          .status(200)
                          .json("Scores successfully Submitted");
                      });
                    });
                  });
                });
              };
            });
          });
        }
      );
    });
  }
);

// router.post(
//   "/updateMeasure",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     let sql1 =
//       "SELECT * FROM PERFORMANCE_MEASURE NATURAL JOIN STUDENT_AVERAGE_SCORE where measureID=" +
//       db.escape(req.body.measureID);

//     db.query(sql1, (err, result) => {
//       if (err) {
//         return res.status(500).json(err);
//       }

//       let totalCount = 0;
//       let passingCount = 0;
//       var thresholdStudents = -1;
//       let passing = false;
//       result.forEach(row => {
//         thresholdStudents = row.projectedStudentsValue;
//         totalCount++;
//         if (row.averageScore >= row.projectedResult) {
//           passingCount++;
//         }
//       });
//       if (
//         totalCount !== 0 &&
//         thresholdStudents !== -1 &&
//         passingCount / totalCount >= thresholdStudents
//       ) {
//         passing = true;
//       }
//       let sql2 =
//         "UPDATE PERFORMANCE_MEASURE SET measureStatus=" +
//         db.escape(passing) +
//         " WHERE measureID=" +
//         db.escape(req.body.measureID);
//       db.query(sql2, (err, result) => {
//         if (err) {
//           return res.status(500).json(err);
//         }
//         res.status(200).json("Updated Successfully!");
//       });
//     });
//   }
// );

module.exports = router;
