const express = require("express");
const passport = require("passport");

const { invite } = require("../../email/invite");

const validateAddEvaluatorInput = require("../../validation/addEvaluator");
const db = require("../../config/dbconnection");

const router = express.Router();

// @route GET api/evaluators
// @desc Displays Evaluators added by the related to a measure [Coordinator first adds and then evaluator can register]
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let evaluators = [];

    let sql = "SELECT * FROM EVALUATOR"

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        evalInfo = {
          name: row.evalName,
          email: row.evalEmail
        };
        evaluators.push(evalInfo);
      });
      res.status(200).json({ evaluators });
    });
  }
);

//@route GET /api/evaluators/invitedEvaluators
router.get(
  "/invitedEvaluators",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let invitedEvaluators = [];
    let sql =
      "SELECT * FROM INVITED_EVALUATOR WHERE corId=" + db.escape(req.user.id);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        invitedEvaluators.push(row.invitedEvalEmail);
      });
      return res.status(200).json({ invitedEvaluators });
    });
  }
);

router.post(
  "/invite",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateAddEvaluatorInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }
    let evaluatorEmail = req.body.evaluatorEmail;
    let adminID = req.user.id;
    let sql0 =
      "SELECT * FROM EVALUATOR WHERE evalEmail=" + db.escape(evaluatorEmail);
    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json();
      } else if (result.length > 0) {
        errors.evaluatorEmail =
          "The Evaluator with this email already exists in the system";
        return res.status(404).json(errors);
      }
      let sql1 =
        "SELECT * FROM INVITED_EVALUATOR WHERE invitedEvalEmail=" +
        db.escape(evaluatorEmail) +
        " AND corId=" +
        db.escape(adminID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } else if (result.length > 0) {
          errors.evaluatorEmail =
            "Invitation has been sent, but Evaluator has not created the account yet; Please contact the evaluator";

          return res.status(404).json(errors);
        }
        let sql2 =
          "INSERT INTO INVITED_EVALUATOR (invitedEvalEmail,corId) VALUES(" +
          db.escape(evaluatorEmail) +
          ", " +
          db.escape(adminID) +
          ")";
        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          invite(req.user.email, req.user.name, evaluatorEmail);
          return res
            .status(200)
            .json(`An invitation email has been sent to ${evaluatorEmail}`);
        });
      });
    });
  }
);

module.exports = router;
