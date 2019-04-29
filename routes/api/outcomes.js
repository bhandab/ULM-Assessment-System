const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const db = require("../../config/dbconnection");
const keys = require("../../config/keys");
const validateOutcomeInput = require("../../validation/learning-outcome");

var router = express.Router();

// @route GET api/outcomes/
// @desc Generates all outcomes created by the coordinator
// @access Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let sql =
      "SELECT * FROM LEARNING_OUTCOME WHERE programID=" +
      db.escape(req.user.programID);
    var outcomesSet = new Set();
    var outcomes = [];
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length > 0) {
        result.forEach(row => {
          if (!outcomesSet.has(row.learnDesc)) {
            outcomesSet.add(row.learnDesc);
            outcomes.push(row.learnDesc);
          }
        });
      }

      res.status(200).json(outcomes);
    });
  }
);
module.exports = router;
