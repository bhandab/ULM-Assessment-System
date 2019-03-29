const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const db = require("../../config/dbconnection");
const validateCycleInput = require("../../validation/assessment-cycle");
const validateOutcomeInput = require("../../validation/learning-outcome");
const validateMeasureInput = require("../../validation/performance-measure");

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
      return res.status(400).json(errors);
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
        return res.status(400).json(errors);
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
    let adminID = db.escape(req.user.id);
    let sql = "SELECT * FROM ASSESSMENT_CYCLE WHERE corId=" + adminID;

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

// @route GET api/cycles/:cycleIdentifier
// @desc Provides outcomes associated with the current cycle
// @access Private

router.get(
  "/:cycleIdentifier",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let adminID = db.escape(req.user.id);
    let cycleIdentifier = db.escape(req.params.cycleIdentifier);
    let outcomes = [];

    let sql =
      "SELECT * FROM LEARNING_OUTCOME" +
      " WHERE cycleID=" +
      cycleIdentifier +
      " AND corId=" +
      adminID;
    db.query(sql, (err, result) => {
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
      let sql1 =
        "SELECT * FROM ASSESSMENT_CYCLE WHERE cycleID = " +
        cycleIdentifier +
        " AND corId = " +
        adminID;
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        console.log(result);
        let cycleName = result[0].cycleTitle;
        console.log(cycleName);
        res.status(200).json({ outcomes, cycleIdentifier, cycleName });
      });
    });
  }
);

// @route POST api/cycles/:cycleIdentifier/:outcomeIdentifier
// @desc Relates an outcome with a cycle
// @access Private

router.post(
  "/:cycleIdentifier/addNewOutcome",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateOutcomeInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    let cycleID = req.params.cycleIdentifier;
    //let outcomeID = db.escape(req.params.outcomeIdentifier);
    let adminID = req.user.id;
    let outcomeName = req.body.outcomeDescription;

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
        return res.status(400).json(errors);
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
  }
);

// @route GET api/cycles/:cycleIdentifier/:outcomeIdentifier
// @desc Retrieves measures associated with the given cycle and outcome
// @access Private

router.get(
  "/:cycleIdentifier/:outcomeIdentifier",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let cycleID = req.params.cycleIdentifier;
    let outcomeID = req.params.outcomeIdentifier;
    let adminID = req.user.id;
    let outcomeName = "";

    let measures = [];

    let sql =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE learnID=" +
      db.escape(outcomeID) +
      " AND corId=" +
      db.escape(adminID);

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      result.forEach(row => {
        measure = {
          measureName: row.measureDesc,
          measureID: row.measureID,
          projectedResult: row.projectedResult,
          projectedStudentNumber: row.projectedStudentsValue,
          courseAssociated: row.courseAssociated
        };
        measures.push(measure);
      });
      let sql1 =
        "SELECT * FROM LEARNING_OUTCOME WHERE learnID=" +
        db.escape(outcomeID) +
        " AND corId=" +
        db.escape(adminID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        outcomeName = result[0].learnDesc;
        res.status(200).json({ measures, cycleID, outcomeID, outcomeName });
      });
    });
  }
);

// @route POST api/cycles/:cycleIdentifier/:outcomeIdentifier/:measureIdentifier
// @desc Relates a measure with a outcome which in turn to cycle
// @access Private

router.post(
  "/:cycleIdentifier/:outcomeIdentifier/addNewMeasure",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateMeasureInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    let cycleID = req.params.cycleIdentifier;
    let outcomeID = req.params.outcomeIdentifier;
    let measureName = req.body.measureDescription;
    let projectedValue = req.body.projectedValue;
    let projectedStudentNumber = req.body.projectedStudentNumber;
    let course = req.body.course;
    let adminID = req.user.id;

    let sql =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE learnID=" +
      db.escape(outcomeID) +
      " AND measureDesc=" +
      db.escape(measureName) +
      " AND corId=" +
      adminID;
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length > 0) {
        errors.measureDescription =
          "The selected performance measure is already associated with this learning outcome";
        return res.status(400).json(errors);
      } else {
        sql =
          "INSERT INTO PERFORMANCE_MEASURE(learnID,measureDesc,projectedResult,projectedStudentsValue,courseAssociated,corId) VALUES (" +
          db.escape(outcomeID) +
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
          ")";
        db.query(sql, (err, result) => {
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
            course
          });
        });
      }
    });
  }
);

module.exports = router;
