const db = require("../../config/dbconnection");
const moment = require("moment");
const createCoordinatorActivity = (adminID, programID, message) => {
  let activitySql =
    "INSERT INTO COORDINATOR_ACTIVITY (corId,corActivity,corActivityTime,programID) VALUES (" +
    db.escape(adminID) +
    ", " +
    db.escape(message) +
    ", " +
    db.escape(moment(Date.now().format("YYYY-MM-DD HH:mm:ss"))) +
    ", " +
    db.escape(programID) +
    ")";
  db.query(activitySql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
  });
};

const createEvaluatorActivity = (evalID, message) => {
  let activitySql =
    "INSERT INTO EVALUATOR_ACTIVITY (evalID,evalActivity,evalActivityTime) VALUES (" +
    db.escape(evalID) +
    ", " +
    db.escape(message) +
    ", " +
    db.escape(moment(Date.now().format("YYYY-MM-DD HH:mm:ss"))) +
    ")";
  db.query(activitySql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
  });
};
