const express = require("express");
const passport = require("passport");
const dateFormat = require("dateformat");

const db = require("../../config/dbconnection");

const router = express.Router();

//GET api/logs/coordinatorLogs
router.get(
  "/coordinatorLogs",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let logs = [];

    let sql =
      "SELECT corActivity, corActivityID, CONVERT_TZ(corActivityTime,'UTC','US/Central') as activityTime FROM COORDINATOR_ACTIVITY WHERE programID=" +
      db.escape(req.user.programID) +
      " ORDER BY corActivityTime DESC";
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        logs.push({
          time: dateFormat(row.activityTime, "dddd, mmmm dS, yyyy, h:MM:ss TT"),
          activity: row.corActivity,
          activityID: row.corActivityID
        });
      });
      res.status(200).json({ logs });
    });
  }
);

//GET api/logs/evalLogs
router.get(
  "/evalLogs",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let logs = [];

    let sql =
      "SELECT evalActivity, evalActivityID, CONVERT_TZ(evalActivityTime,'UTC','US/Central') as activityTime FROM EVALUATOR_ACTIVITY WHERE evalID=" +
      db.escape(req.user.id) +
      " ORDER BY evalActivityTime DESC";
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        logs.push({
          time: dateFormat(row.activityTime, "dddd, mmmm dS, yyyy, h:MM:ss TT"),
          activity: row.evalActivity,
          activityID: row.evalActivityID
        });
      });
      res.status(200).json({ logs });
    });
  }
);

module.exports = router;
