const express = require("express");
const passport = require("passport");
const async = require("async");

const db = require("../../config/dbconnection");
const validateRubricStructureInput = require("../../validation/rubric");

const router = express.Router();

// @route POST api/rubrics/createRubric
// @desc Creates a new rubric
// @access Private
router.post(
  "/createRubric",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let { errors, isValid } = validateRubricStructureInput(req.body);

    if (!isValid) {
      return res.status(404).json(errors);
    }

    let noOfRows = req.body.rows;
    let noOfColumns = req.body.columns;
    let rubricTitle = req.body.rubricName;
    let adminID = req.user.id;

    let rubricDetails = {};

    let sql3 =
      "SELECT * FROM TOOL NATURAL JOIN RUBRIC WHERE rubricTitle=" +
      db.escape(rubricTitle) +
      " AND corId=" +
      db.escape(adminID);
    db.query(sql3, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length > 0) {
        errors.rubricName = "The Rubric with this name already exists";

        return res.status(404).json(errors);
      }
      let sql5 =
        "INSERT INTO TOOL (corId, toolType) VALUES (" +
        db.escape(adminID) +
        ", " +
        db.escape("rubric") +
        ")";
      db.query(sql5, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        let rubricID = result.insertId;
        let sql6 =
          "INSERT INTO RUBRIC (toolID,rubricTitle,rubricRows,rubricColumns) " +
          "VALUES (" +
          db.escape(rubricID) +
          ", " +
          db.escape(rubricTitle) +
          ", " +
          db.escape(noOfRows) +
          ", " +
          db.escape(noOfColumns) +
          ")";

        db.query(sql6, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          rubricDetails.strutureInfo = {
            noOfRows,
            noOfColumns,
            rubricTitle,
            rubricID,
            adminID
          };
          let scales = [];
          let values = [];
          let sql7 =
            "INSERT INTO RATING_SCALE (toolID, scaleDesc,scaleValue) VALUES ?";

          req.body.scales.sort((a, b) => b.scaleValue - a.scaleValue);
          for (var i = 0; i < noOfColumns; i++) {
            values.push([
              rubricID,
              req.body.scales[i].scaleDesc,
              req.body.scales[i].scaleValue
            ]);
          }

          db.query(sql7, [values], (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }

            let scaleID = result.insertId;
            for (var i = 0; i < noOfColumns; i++) {
              scales.push({
                scaleID,
                scaleDescription: req.body.scales[i].scaleDesc,
                scaleValue: req.body.scales[i].scaleValue
              });
              scaleID++;
            }
            rubricDetails.scaleInfo = scales;

            let criterias = [];
            let crValues = [];
            let sql8 = "INSERT INTO CRITERIA (toolID,criteriaDesc) VALUES ?";
            let criteriaDescription = "";

            for (var i = 0; i < noOfRows; i++) {
              crValues.push([rubricID, criteriaDescription]);
            }

            db.query(sql8, [crValues], (err, result) => {
              if (err) {
                return res.status(500).json(err);
              }
              let criteriaID = result.insertId;
              for (var i = 0; i < noOfRows; i++) {
                criterias.push({ criteriaID, criteriaDescription });
                criteriaID++;
              }
              rubricDetails.criteriaInfo = criterias;

              let table = [];
              async.forEachOf(
                criterias,
                function(value, key, callback) {
                  let cellDescription = "";
                  let associatedCriteriaID = value.criteriaID;
                  console.log(associatedCriteriaID);
                  let rows = [];

                  let index1 = key;
                  let index2 = 0;

                  async.forEachOf(
                    scales,
                    function(value, key, inner_callback) {
                      let associatedScaleID = value.scaleID;
                      index2 = key;
                      console.log(associatedScaleID);
                      let sql9 =
                        "INSERT INTO LEVEL_DESCRIPTION (criteriaID, scaleID, toolID) " +
                        "VALUES (" +
                        db.escape(associatedCriteriaID) +
                        ", " +
                        db.escape(associatedScaleID) +
                        ", " +
                        db.escape(rubricID) +
                        ")";
                      console.log(sql5);

                      db.query(sql9, function(err, result) {
                        if (!err) {
                          console.log(result);
                          let levelID = result.insertId;
                          rows.push({
                            levelID,
                            associatedCriteriaID,
                            associatedScaleID,
                            cellDescription
                          });
                          inner_callback();
                        } else {
                          console.log("Reaches here");
                          return inner_callback(err);
                        }
                      });
                    },
                    function(err) {
                      if (err) {
                        throw err;
                      } else {
                        console.log(rows);
                        table.push(rows);
                        console.log(table);
                        rubricDetails.cellInfo = table;
                        if (
                          index1 === criterias.length - 1 &&
                          index2 === scales.length - 1
                        ) {
                          res.status(200).json({ rubricDetails });
                        }
                      }
                    }
                  );

                  callback();
                },
                function(err) {
                  if (err) {
                    throw err;
                  }
                }
              );
            });
          });
        });
      });
    });
    // });
  }
);

// @route GET api/rubrics
// @desc Retrieves all the rubrics created by the coordinator
// @access Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let rubrics = [];

    let sql2 =
      "SELECT * FROM TOOL NATURAL JOIN RUBRIC WHERE corId=" +
      db.escape(req.user.id);

    db.query(sql2, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        rubric = {
          rubricID: row.toolID,
          rubricTitle: row.rubricTitle,
          noOfRows: row.rubricRows,
          noOfColumns: row.rubricColumns
        };
        rubrics.push(rubric);
      });
      res.status(200).json({ rubrics });
    });
    //});
  }
);

// @route GET api/cycles/:rubricIdentifier/rubricDetails
// @desc Retrieves details of the given rubric within a outcome
// @access Private

router.get(
  "/:rubricIdentifier/rubricDetails",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let rubricID = req.params.rubricIdentifier;
    let adminID = req.user.id;

    let rubricDetails = {};

    let sql1 =
      "SELECT * FROM TOOL NATURAL JOIN RUBRIC WHERE toolID=" +
      db.escape(rubricID) +
      "AND rubricTitle=" +
      db.escape(req.body.rubricName);

    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res.status(404).json({
          errors: "Rubric with the given details cannot be retrieved"
        });
      }

      rubricDetails.structureInfo = {
        noOfRows: result[0].rubricRows,
        noOfColumns: result[0].rubricColumns,
        rubricTitle: result[0].rubricTitle,
        rubricID,
        adminID
      };
      let scales = [];
      let sql3 =
        "SELECT * FROM RATING_SCALE WHERE toolID=" +
        db.escape(rubricID) +
        " ORDER BY scaleID";
      db.query(sql3, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        result.forEach(row => {
          scale = {
            scaleDescription: row.scaleDesc,
            scaleID: row.scaleID,
            scaleValue: row.scaleValue
          };
          scales.push(scale);
        });
        rubricDetails.scaleInfo = scales;

        let criterias = [];
        let sql4 =
          "SELECT * FROM CRITERIA WHERE toolID=" +
          db.escape(rubricID) +
          " ORDER BY criteriaID";
        db.query(sql4, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          result.forEach(row => {
            let criteriaWeight = 1;

            if (row.criteriaWeight) {
              criteriaWeight = row.criteriaWeight / 100;
            }

            criteria = {
              criteriaID: row.criteriaID,
              criteriaWeight,
              criteriaDescription: row.criteriaDesc
            };
            criterias.push(criteria);
          });
          rubricDetails.criteriaInfo = criterias;

          let cells = [];
          let rows = [];
          let count = 1;
          let sql5 =
            "SELECT * FROM LEVEL_DESCRIPTION WHERE toolID=" +
            db.escape(rubricID) +
            " ORDER BY levelID";
          db.query(sql5, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }
            console.log(result.length);
            result.forEach(row => {
              cellDetail = {
                cellID: row.levelID,
                criteriaID: row.criteriaID,
                scaleID: row.scaleID,
                cellDescription: row.levelDesc
              };

              rows.push(cellDetail);
              count++;
              if (count === rubricDetails.scaleInfo.length) {
                cells.push(rows);
                rows = [];
                count = 0;
              }
            });
            rubricDetails.table = cells;
            res.status(200).json({ rubricDetails });
          });
        });
      });
      //});
    });
  }
);

module.exports = router;
