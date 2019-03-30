const express = require("express");
const passport = require("passport");

const db = require("../../config/dbconnection");

var router = express.Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {}
);

module.exports = router;
