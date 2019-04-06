const express = require("express");
const passport = require("passport");

const { inviteEvaluator } = require("../../email/invite");

const validateAddEvaluatorInput = require("../../validation/addEvaluator");
const db = require("../../config/dbconnection");

const router = express.Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let evaluators = [];
    let invitedEvaluators = [];

    let sql = "SELECT * FROM EVALUATOR WHERE corId=" + db.escape(req.user.id);

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        if (row.evalName !== "") {
          evalInfo = {
            name: row.evalName,
            email: row.evalEmail
          };
          evaluators.push(evalInfo);
        } else {
          invitedEvaluators.push(row.evalEmail);
        }
      });
      res.status(200).json({ evaluators, invitedEvaluators });
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
    let sql1 =
      "SELECT * FROM EVALUATOR WHERE evalEmail=" +
      db.escape(evaluatorEmail) +
      " AND corId=" +
      db.escape(adminID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length > 0) {
        if (result[0].evalName === "") {
          errors.evaluatorEmail =
            "Invitation has been sent, but Evaluator has not created the account yet; Please contact the evaluator";
        } else {
          errors.evaluatorEmail =
            "Evaluator already exists. Please  check your My Evaluators List";
        }
        return res.status(404).json(errors);
      }
      let sql2 =
        "INSERT INTO EVALUATOR (evalEmail,corId) VALUES(" +
        db.escape(evaluatorEmail) +
        ", " +
        db.escape(adminID) +
        ")";
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        inviteEvaluator(req.user.email, req.user.name, evaluatorEmail);
        return res
          .status(200)
          .json(`An invitation email has been sent to ${evaluatorEmail}`);
      });
    });
  }
);

module.exports = router;
