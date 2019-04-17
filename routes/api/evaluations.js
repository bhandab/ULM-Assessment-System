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
          studentName: row.studentName,
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

    let sql0 = "SELECT * FROM RUBRIC WHERE toolID=" + db.escape(rubricID);
    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json("Rubric Not Found");
      } else if (req.body.criteriaScores.length !== result[0].rubricRows) {
        return res.status(404).json("Please Grade all criterias of the rubric");
      }
      req.body.criteriaScores.forEach(score => {
        let cScore = 1;
        if (score.criteriaWeight) {
          cScore = (cScore * parseFloat(criteriaWeight)) / 100;
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

      let sql1 =
        "INSERT INTO EVALUATE (toolID,measureID,criteriaID,studentID,measureEvalID,criteriaScore) VALUES ?";
      db.query(sql1, [evaluatedScores], (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(200).json(evalInfo);
      });
    });
  }
);

router.post(
  "/updateScores",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let evalID = req.user.id;
    let rubricID = req.body.rubricID;
    let measureID = req.body.measureID;
    let studentID = req.body.studentID;
    let measureEvalID = req.body.measureEvalID;

    let sql0 = "SELECT * FROM RUBRIC WHERE toolID=" + db.escape(rubricID);

    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json("Rubric Not Found");
      } else if (req.body.criteriaScores.length !== result[0].rubricRows) {
        return res.status(404).json("Please Grade all criterias of the rubric");
      }

      async.forEachOf(
        req.body.criteriaScores,
        (value, key, callback) => {
          let sql1 =
            "UPDATE EVALUATE SET criteriaScore=" +
            db.escape(parseFloat(value.criteriaScore)) +
            " WHERE toolID=" +
            db.escape(rubricID) +
            " AND measureID=" +
            db.escape(measureID) +
            " AND criteriaID=" +
            db.escape(value.criteriaID) +
            " AND studentID=" +
            db.escape(studentID) +
            " AND measureEvalID=" +
            db.escape(measureEvalID);
          db.query(sql1, (err, result) => {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        err => {
          if (err) {
            return res.status(500).json(err);
          }
          res.status(200).json("Update Successful");
        }
      );
    });
  }
);

module.exports = router;
