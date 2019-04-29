const express = require("express");
const passport = require("passport");
const moment = require("moment");
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
      "SELECT corActivity, CONVERT_TZ(corActivityTime,'UTC','US/Central') as activityTime FROM COORDINATOR_ACTIVITY WHERE programID=" +
      db.escape(req.user.programID) +
      " ORDER BY corActivityTime DESC";
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        logs.push({
          time: dateFormat(row.activityTime),
          activity: row.corActivity
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
      "SELECT * FROM EVALUATOR_ACTIVITY WHERE evalID=" +
      db.escape(req.user.id) +
      " ORDER BY evalActivityTime DESC";
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        logs.push({ time: row.evalActivityTime, activity: row.evalActivity });
      });
      res.status(200).json({ logs });
    });
  }
);

module.exports = router;
