const express = require("express");
const passport = require("passport");

const db = require("../../config/dbconnection");

const router = express.Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let evalID = req.user.id;

    let sql;
  }
);
