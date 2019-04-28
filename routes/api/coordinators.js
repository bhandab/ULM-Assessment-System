const express = require("express");
const passport = require("passport");

const { invite } = require("../../email/invite");

const validateAddCoordinateInput = require("../../validation/addCoordinator");
const validateCreateProgramInput = require("../../validation/createProgram");
const db = require("../../config/dbconnection");

const router = express.Router();

// @route GET api/coordinators/programs
// @desc Lists all the programs
// @access Private
router.get(
  "/programs",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let programs = [];
    let sql = "SELECT * FROM PROGRAM";
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        programs.push({
          programName: row.programName,
          programID: row.programID
        });
      });
      return res.status(200).json(programs);
    });
  }
);

// @route POST api/coordinators/createProgram
// @desc Creates a new program
// @access Private
router.post(
  "/createProgram",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateCreateProgramInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }

    let programName = req.body.programName;

    let sql =
      "SELECT * FROM PROGRAM WHERE programName=" + db.escape(programName);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length > 0) {
        errors.alreadyExistingProgram = "This program already exists!";
        return res.status(404).json(errors);
      }
      let sql1 =
        "INSERT INTO PROGRAM (programName) VALUES (" +
        db.escape(programName) +
        ")";
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(200).json("Program Created Successfully!");
      });
    });
  }
);

// @route api/coordinators/updateProgram
// @desc Updates program name
// @access Private
router.post(
  "/updateProgram",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateCreateProgramInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }

    let programName = req.body.programName;
    let programID = req.body.programID;

    let sql = "SELECT * FROM PROGRAM WHERE programID=" + db.escape(programID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        errors.alreadyExistingProgram = "This program Does not exists!";
        return res.status(404).json(errors);
      }
      let sql1 =
        "UPDATE PROGRAM SET programName=" +
        db.escape(programName) +
        " WHERE programID=" +
        db.escape(programID);

      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(200).json("Program Updated Successfully!");
      });
    });
  }
);

// @route api/coordinators/invitedCoordinators/:programID
// @desc Lists invited coordinators list
// @access Private
router.get(
  "/invitedCoordinators/:programID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let invitedCoordinators = [];
    let programID = req.params.programID
    let sql =
      "SELECT * FROM INVITED_COORDINATOR WHERE programID=" +
      db.escape(req.params.programID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        invitedCoordinators.push(row.invitedCorEmail);
      });
      return res.status(200).json({programID,invitedCoordinators});
    });
  }
);

/** Registered Coordinators */
//Angel
// @route api/coordinators/registeredCoordinators/:programID
// @desc Lists registered coordinators for the program
// @access Private
router.get(
  "/registeredCoordinators/:programID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let registeredCoordinators = [];
    let sql =
      "SELECT * FROM COORDINATOR NATURAL JOIN PROGRAM WHERE programID = " +
      db.escape(req.params.programID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        registeredCoordinators.push({
          name: row.corFirstName + " " + row.corLastName,
          email: row.corEmail,
          program: row.programName,
          corID: row.corId
        });
      });
      return res.status(200).json(registeredCoordinators);
    });
  }
);

// @route api/coordinators/invite
// @desc Invite a new coordinator
// @access Private
router.post(
  "/invite",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateAddCoordinateInput(req.body);
    if (!isValid) {
      return res.status(404).json(errors);
    }
    let coordinatorEmail = req.body.coordinatorEmail;
    let programID = req.body.programID;
    let adminID = req.user.id;
    let sql0 =
      "SELECT * FROM COORDINATOR WHERE isActive=true AND corEmail=" +
      db.escape(coordinatorEmail) +
      " AND programID=" +
      db.escape(programID);
    db.query(sql0, (err, result) => {
      if (err) {
        return res.status(500).json();
      } else if (result.length > 0) {
        errors.coordinatorEmail =
          "The Coordinator with this email already exists in the Program";
        return res.status(404).json(errors);
      }
      let sql1 =
        "SELECT * FROM INVITED_COORDINATOR WHERE invitedCorEmail=" +
        db.escape(coordinatorEmail) +
        " AND superID=" +
        db.escape(adminID) +
        " AND programID=" +
        db.escape(programID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } else if (result.length > 0) {
          errors.coordinatorEmail =
            "Invitation has been sent, but coordinator has not created the account yet; Please contact the coordinator";

          return res.status(404).json(errors);
        } else {
          let sql2 =
            "INSERT INTO INVITED_COORDINATOR (invitedCorEmail,superId,programID) VALUES(" +
            db.escape(coordinatorEmail) +
            ", " +
            db.escape(adminID) +
            ", " +
            db.escape(programID) +
            ")";
          invite(req.user.email, "ULM Evaluation System", coordinatorEmail)
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

// @route api/coordinators/deleteCoordinator
// @desc Deletes a coordinator from the program
// @access Private
router.post(
  "/deleteCoordinator",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let deleteUser = req.body.cordID;
    console.log(deleteUser);
    let sql =
      "UPDATE COORDINATOR SET isActive=false WHERE corId=" +
      db.escape(deleteUser);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(200).json("Successfully Deleted!");
    });
  }
);

// @route api/coordinators/deletedInvitedCoordinator
// @desc Deletes invited coordinator
// @access Private
router.post(
  "/deleteInvitedCoordinator",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let deleteEmail = req.body.corEmail;
    let errors = {};
    let sql =
      "SELECT * FROM INVITED_COORDINATOR WHERE invitedCorEmail=" +
      db.escape(deleteEmail);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.message = "The evaluator is not in the invitee list";
        return res.status(404).json(errors);
      }
      let sql1 =
        "DELETE FROM INVITED_COORDINATOR WHERE invitedCorEmail=" +
        db.escape(deleteEmail);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(200).json("Deleted Successfully!");
      });
    });
  }
);
module.exports = router;
