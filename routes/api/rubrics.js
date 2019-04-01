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
  (req, res) => {}
);

module.exports = router;
