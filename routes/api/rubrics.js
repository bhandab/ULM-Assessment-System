const express = require("express");
const passport = require("passport");
const async = require("async");

const isEmpty = require("../../validation/isEmpty");
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
    let weighted = req.body.weighted;
    let programID = req.user.programID;

    let rubricDetails = {};

    let sql3 =
      "SELECT * FROM TOOL NATURAL JOIN RUBRIC WHERE rubricTitle=" +
      db.escape(rubricTitle) +
      " AND programID=" +
      db.escape(programID);
    db.query(sql3, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length > 0) {
        errors.rubricName = "The Rubric with this name already exists";

        return res.status(404).json(errors);
      }
      let sql5 =
        "INSERT INTO TOOL (programID, toolType) VALUES (" +
        db.escape(programID) +
        ", " +
        db.escape("rubric") +
        ")";
      db.query(sql5, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        let rubricID = result.insertId;
        let sql6 =
          "INSERT INTO RUBRIC (toolID,rubricTitle,rubricRows,rubricColumns,weighted) " +
          "VALUES (" +
          db.escape(rubricID) +
          ", " +
          db.escape(rubricTitle) +
          ", " +
          db.escape(noOfRows) +
          ", " +
          db.escape(noOfColumns) +
          ", " +
          db.escape(weighted) +
          ")";

        db.query(sql6, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          rubricDetails.strutureInfo = {
            noOfRows,
            noOfColumns,
            rubricTitle,
            weighted,
            rubricID,
            programID
          };
          let scales = [];
          let values = [];
          let sql7 =
            "INSERT INTO RATING_SCALE (toolID, scaleDesc,scaleValue) VALUES ?";

          //req.body.scales.sort((a, b) => b.scaleValue - a.scaleValue);
          for (var i = 0; i < noOfColumns; i++) {
            values.push([rubricID, i + 1 + "", i + 1]);
          }

          db.query(sql7, [values], (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }

            let scaleID = result.insertId;
            for (var i = 0; i < noOfColumns; i++) {
              scales.push({
                scaleID,
                scaleDescription: i + 1 + "",
                scaleValue: i + 1
              });
              scaleID++;
            }
            rubricDetails.scaleInfo = scales;

            let criterias = [];
            let crValues = [];
            let sql8 =
              "INSERT INTO CRITERIA (toolID,criteriaDesc,criteriaWeight) VALUES ?";
            let criteriaDescription = "Criteria ";
            let weightedValue = 1;
            if (weighted) {
              weightedValue = 0;
            }
            for (var i = 0; i < noOfRows; i++) {
              crValues.push([
                rubricID,
                i === 0
                  ? i + 1 + "st " + criteriaDescription
                  : i == 1
                  ? i + 1 + "nd " + criteriaDescription
                  : i == 2
                  ? i + 1 + "rd " + criteriaDescription
                  : i + 1 + "th " + criteriaDescription,
                weightedValue
              ]);
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
      "SELECT * FROM TOOL NATURAL JOIN RUBRIC WHERE programID=" +
      db.escape(req.user.programID);

    db.query(sql2, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      result.forEach(row => {
        rubric = {
          rubricID: row.toolID,
          rubricTitle: row.rubricTitle,
          noOfRows: row.rubricRows,
          noOfColumns: row.rubricColumns,
          weighted: row.weighted
        };
        rubrics.push(rubric);
      });
      res.status(200).json({ rubrics });
    });
  }
);

// @route GET api/rubrics/:rubricIdentifier/rubricDetails
// @desc Retrieves details of the given rubric within a outcome
// @access Private

router.get(
  "/:rubricIdentifier/rubricDetails",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let rubricID = req.params.rubricIdentifier;
    let programID = req.user.programID;

    let rubricDetails = {};

    let sql1 =
      "SELECT * FROM TOOL NATURAL JOIN RUBRIC WHERE toolID=" +
      db.escape(rubricID);

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
        weighted: result[0].weighted,
        rubricID,
        programID
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
            //let criteriaWeight = 1;

            //if (row.criteriaWeight) {
            criteriaWeight = row.criteriaWeight * 100;
            //}

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
          let count = 0;
          let sql5 =
            "SELECT * FROM LEVEL_DESCRIPTION WHERE toolID=" +
            db.escape(rubricID) +
            " ORDER BY levelID";
          db.query(sql5, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }

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
    });
  }
);

// @route POST api/cycles/:rubricIdentifier/:cellIdentifier/updateCriteria
// @desc Updates criteria of a rubric
// @access Private
router.post(
  "/:rubricIdentifier/updateCriteria",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let rubricID = req.params.rubricIdentifier;
    let criteriaID = req.body.criteriaID;
    let programID = req.user.programID;
    let criteriaDesc = req.body.criteriaDesc;
    if (isEmpty(criteriaDesc)) {
      return res.status(404).json("Criteria Desc Cannot be Empty");
    }

    let sql1 =
      "SELECT * FROM CRITERIA WHERE toolID=" +
      db.escape(rubricID) +
      " AND criteriaID=" +
      db.escape(criteriaID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res
          .status(404)
          .json({ errors: "Rubric Cell with the given details not found" });
      }
      let sql2 =
        "UPDATE CRITERIA SET criteriaDesc=" +
        db.escape(criteriaDesc) +
        " WHERE criteriaID=" +
        db.escape(criteriaID);
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(200).json({ criteriaDesc, programID, criteriaID, rubricID });
      });
    });
  }
);

// @route POST api/cycles/:rubricIdentifier/updateLevelDescription
// @desc Updates level description of a rubric
// @access Private
router.post(
  "/:rubricIdentifier/updateLevelDescription",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let rubricID = req.params.rubricIdentifier;
    let cellID = req.body.cellID;
    let programID = req.user.programID;
    let levelDesc = req.body.levelDesc;
    let sql1 =
      "SELECT * FROM LEVEL_DESCRIPTION WHERE toolID=" +
      db.escape(rubricID) +
      " AND levelID=" +
      db.escape(cellID);
    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        return res
          .status(404)
          .json({ errors: "Rubric Cell with the given details not found" });
      }
      let sql2 =
        "UPDATE LEVEL_DESCRIPTION SET levelDesc=" +
        db.escape(levelDesc) +
        " WHERE levelID=" +
        db.escape(cellID);
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(200).json({ levelDesc, programID, cellID, rubricID });
      });
    });
  }
);

// @route POST api/cycles/:rubricIdentifier/updateWeight
// @desc Updates criteria weight of a rubric
// @access Private
router.post(
  "/:rubricIdentifier/updateWeight",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let rubricID = req.params.rubricIdentifier;
    let programID = req.user.programID;
    let errors = {};
    let totalWeight = 0;
    for (var i = 0; i < req.body.length; i++) {
      req.body[i].weight = parseFloat(req.body[i].weight);
      totalWeight += req.body[i].weight;
    }
    if (totalWeight !== 100) {
      errors.weightSum = "Weight Sum is not equal to hundred";
      return res.status(404).json({ errors });
    }
    //parseFloat(req.body.weight);
    let sql = "SELECT * FROM RUBRIC WHERE toolID=" + db.escape(rubricID);

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        errors.param = "Params Value Invalid";
        return res.status(404).json({ errors });
      }
      async.forEachOfSeries(
        req.body,
        (value, key, callback) => {
          let sql1 =
            "UPDATE CRITERIA SET criteriaWeight=" +
            db.escape(value.weight / 100) +
            " WHERE toolID=" +
            db.escape(rubricID) +
            " AND criteriaID=" +
            db.escape(value.criteriaID);
          db.query(sql1, (err, result) => {
            if (!err) {
              //console.log("Sucess 1");
              callback();
            } else {
              //console.log("Reaches here");
              return callback(err);
            }
          });
        },
        err => {
          if (err) {
            return res.status(500).json(err);
          }
          return res.status(200).json("Sucess");
        }
      );
    });
  }
);

// @route POST api/rubrics/:rubricIdentifier/updateScaleDescription
// @desc Updates scale description  of a rubric
// @access Private
router.post(
  "/:rubricIdentifier/updateScaleDescription",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let rubricID = req.params.rubricIdentifier;
    let scaleID = req.body.scaleID;
    let programID = req.user.programID;
    let scaleDesc = req.body.scaleDescription;

    let errors = {};
    if (isEmpty(scaleDesc)) {
      errors.EmptyScaleDescription = "Scale Description Cannot be Empty";
      return res.status(404).json(errors);
    }

    let sql1 =
      "SELECT * FROM RATING_SCALE WHERE toolID=" +
      db.escape(rubricID) +
      " AND scaleID=" +
      db.escape(scaleID);

    db.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else if (result.length <= 0) {
        errors.paramsError = "Rubric Cell with the given details not found";
        return res.status(404).json({ errors });
      }
      let sql2 =
        "UPDATE RATING_SCALE SET scaleDesc=" +
        db.escape(scaleDesc) +
        " WHERE scaleID=" +
        db.escape(scaleID);
      db.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(200).json({ scaleDesc, programID, scaleID, rubricID });
      });
    });
  }
);

// @route POST api/rubrics/delete
// @desc Deletes a Rubric
// @access Private
router.post(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let programID = req.user.programID;
    let rubricID = req.body.rubricID;
    let errors = {};

    let sql = "SELECT * FROM RUBRIC WHERE toolID=" + db.escape(rubricID);
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length <= 0) {
        errors.rubricNotFound = "Rubric Does not Exist!";
        return res.status(404).json(errors);
      }

      let sql1 =
        "SELECT * FROM PERFORMANCE_MEASURE WHERE toolID=" + db.escape(rubricID);
      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        if (result.length > 0) {
          errors.rubricAssociatedWithMeasure =
            "Rubric has been linked to a Measure!";
          return res.status(404).json(errors);
        }
        let sql2 = "DELETE FROM TOOL WHERE toolID=" + db.escape(rubricID);
        db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          res.status(200).json("Deleted Successfully!");
        });
      });
    });
  }
);
module.exports = router;
