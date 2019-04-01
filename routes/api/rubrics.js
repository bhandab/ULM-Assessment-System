const express = require("express");
const passport = require("passport");

const db = require("../../config/dbconnection");

var router = express.Router();

// @route api/rubrics
// @desc Lists list of rubrics globally
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
          let sql= "SELECT  * FROM TOOL NATURAL JOIN RUBRIC WHERE corId=" + db.escape(req.user.id);
          var rubricSet = new Set();
          var rubrics = [];

          db.query(sql, (err, result) => {
            if (err) {
              return res.status(500).json(err);
            } 
            
            else if (result.length > 0) {

              result.forEach(row => {
                 if (!rubricSet.has(row.rubricTitle)) {
                   
                      rubric = {
                      rubricID:row.toolID,
                      rubricTitle: row.rubricTitle,
                      noOfRows: row.rubricRows,
                      noOfColumns: row.rubricColumns
                  };

                  rubricSet.add(row.rubricTitle);
                  rubrics.push(rubric);
                }
              });
              
            }
            res.status(200).json(rubrics);
            
          });
  });

router.get(
  "/:rubricIdentifier/rubricDetails",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {

    let rubricID = req.params.rubricIdentifier;
    let rubricDetails = {};

    let sql1 =
      "SELECT * FROM  RUBRIC NATURAL JOIN TOOL WHERE toolID=" +  db.escape(rubricID)+"AND corId= "+ db.escape(req.user.id);

      db.query(sql1, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        } 
        else if(result.length<=0){
          return res.status(404).json({errors:"Cannot retrieve data"})
        }

          rubricDetails.strutureInfo = {
          noOfRows: result[0].rubricRows,
          noOfColumns: result[0].rubricColumns,
          rubricTitle: result[0].rubricTitle,
          rubricID
        };
        

        let scales = [];
        let sql2 =
        "SELECT * FROM RATING_SCALE WHERE toolID=" +db.escape(rubricID) +" ORDER BY scaleID";
          db.query(sql2, (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }
          result.forEach(row => {
            scale = {
              scaleDescription: row.scaleDesc,
              scaleID: row.scaleID
            };

            scales.push(scale);
          });
         rubricDetails.scaleInfo = scales;
        
          let criterias = [];
          let sql3 = "SELECT * FROM CRITERIA WHERE toolID=" + db.escape(rubricID) +" ORDER BY criteriaID";
          db.query(sql3, (err, result) => {
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
            let sql4 =
              "SELECT * FROM LEVEL_DESCRIPTION WHERE toolID=" + db.escape(rubricID) +" ORDER BY levelID";
            db.query(sql4, (err, result) => {
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
                cells.push(cellDetail);
              });
              rubricDetails.table = cells;

              res.status(200).json({ rubricDetails});
            });
          });
        });
      });
    });





module.exports = router;
