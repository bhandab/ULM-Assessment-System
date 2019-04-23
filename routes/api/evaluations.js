const express = require("express");
const passport = require("passport");
const async = require("async");

const db = require("../../config/dbconnection");

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
          studentName: row.studentFirstName+" "+row.studentLastName,
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
  "/evaluationRubrics",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let evalID = req.user.id;
    let errors = {};
    let rubrics = [];
    let rubricsSet = new Set();

    let sql =
      "SELECT * FROM EVALUATOR_ASSIGN NATURAL JOIN MEASURE_EVALUATOR NATURAL JOIN EVALUATOR NATURAL JOIN RUBRIC WHERE evalID=" +
      db.escape(evalID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        if (!rubricsSet.has(row.rubricTitle)) {
          rubricsSet.add(row.rubricTitle);
          rubrics.push({ rubricName: row.rubricTitle, rubricID: row.toolID });
        }
      });
      res.status(200).json(rubrics);
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
        " AND measureEvalID=" +
        db.escape(measureEvalID);
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
                measureEvalID,
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
              "INSERT INTO EVALUATE (toolID,measureID,criteriaID,studentID,measureEvalID,criteriaScore) VALUES ?";
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
    let measureEvalID = req.body.measureEvalID;
    let criteriaID = req.body.criteriaID;
    let criteriaScore = req.body.criteriaScore;

    let sql0 = "SELECT * FROM RUBRIC WHERE toolID=" + db.escape(rubricID);

    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json("Rubric Not Found");
      }
      let weighted = result[0].weighted;
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
        " AND measureEvalID=" +
        db.escape(measureEvalID);
      db.query(sql1, (err, result) => {
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
          " AND measureEvalID=" +
          db.escape(measureEvalID);
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
            " AND measureEvalID=" +
            db.escape(measureEvalID);
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
                " AND measureEvalID=" +
                db.escape(measureEvalID);
              db.query(sql3, (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                } else {
                  updateAverageScore();
                }
              });
            } else {
              let sql5 =
                "INSERT INTO RUBRIC_SCORE (toolID,studentID,measureEvalID,rubricScore) VALUES (" +
                db.escape(rubricID) +
                ", " +
                db.escape(studentID) +
                ", " +
                db.escape(measureEvalID) +
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

                      return res
                        .status(200)
                        .json({ criteriaID, criteriaScore });
                    });
                  } else {
                    updateAverageScore();
                  }
                });
              });
            }
            let updateAverageScore = () => {
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
                  return res.status(200).json({ criteriaID, criteriaScore });
                });
              });
            };
          });
        });
      });
    });
  }
);

module.exports = router;
