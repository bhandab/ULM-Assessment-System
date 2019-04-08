const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const db = require("../../config/dbconnection");
const validateMeasureInput = require("../../validation/performance-measure");

const router = express.Router();

// @route GET api/measures
// @desc Generates all global performance measures created by the coordinator
// @access Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let sql =
      "SELECT * FROM PERFORMANCE_MEASURE WHERE corId=" + db.escape(req.user.id);
    let measureDescs = new Set();
    let measures = [];
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length > 0) {
        result.forEach(row => {
          if (!measureDescs.has(row.measureDesc)) {
            measureDescs.add(row.measureDesc);
            measure = {
              measureDescription: row.measureDesc,
              projectedResult: row.projectedResult,
              resultScale: row.projectedValueScale,
              projectedStudentNumber: row.projectedStudentsValue,
              studentNumberScale: row.studentNumberScale,
              course: row.courseAssociated,
              toolName: row.toolName,
              toolType: row.toolType,
              toolID: row.toolID
            };
            measures.push(measure);
          }
        });
      }
      res.status(200).json(measures);
    });
  }
);

module.exports = router;
