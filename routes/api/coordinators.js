const express = require("express");
const passport = require("passport");

const { invite } = require("../../email/invite");

const validateAddCoordinateInput = require("../../validation/addCoordinator");
const db = require("../../config/dbconnection");

const router = express.Router();

router.get(
  "/invitedCoordinators",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let invitedCoordinators = [];
    let sql =
      "SELECT * FROM INVITED_COORDINATOR WHERE superID=" +
      db.escape(req.user.id);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        invitedCoordinators.push(row.invitedCorEmail);
      });
      return res.status(200).json({ invitedCoordinators });
    });
  }
);

router.post(
  "/invite",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateAddCoordinateInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }
    let coordinatorEmail = req.body.coordinatorEmail;
    let programName = req.body.programName;
    let adminID = req.user.id;
    let sql0 =
      "SELECT * FROM COORDINATOR WHERE corEmail=" + db.escape(coordinatorEmail);
    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json();
      } else if (result.length > 0) {
        errors.coordinatorEmail =
          "The Coordinator with this email already exists in the system";
        return res.status(404).json(errors);
      }
      let sql1 =
        "SELECT * FROM INVITED_COORDINATOR WHERE invitedCorEmail=" +
        db.escape(coordinatorEmail) +
        " AND superID=" +
        db.escape(adminID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } else if (result.length > 0) {
          errors.coordinatorEmail =
            "Invitation has been sent, but coordinator has not created the account yet; Please contact the coordinator";

          return res.status(404).json(errors);
        } else {
          let sql2 =
            "INSERT INTO INVITED_COORDINATOR (invitedCorEmail,programName,superId) VALUES(" +
            db.escape(coordinatorEmail) +
            ", " +
            db.escape(programName) +
            ", " +
            db.escape(adminID) +
            ")";
          invite(req.user.email, req.user.name, coordinatorEmail)
            .then(value => {
              db.query(sql2, (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                }

                res
                  .status(200)
                  .json(
                    `An invitation email has been sent to ${coordinatorEmail}`
                  );
              });
            })
            .catch(e => {
              return res
                .status(404)
                .json(
                  "There was some problem adding and sending email to the coordinator"
                );
            });
        }
      });
    });
  }
);

module.exports = router;
