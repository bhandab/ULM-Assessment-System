const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const db = require("./config/dbconnection");
const userRouter = require("./routes/api/users");
const outcomeRouter = require("./routes/api/outcomes");
const measureRouter = require("./routes/api/measures");
const cycleRouter = require("./routes/api/assessment-cycles");
const rubricRouter = require("./routes/api/rubrics");
const evaluatorRouter = require("./routes/api/evaluators");
const coordinatorRouter = require("./routes/api/coordinators");


const app = express();

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

const port = process.env.PORT || 5000;

app.use("/api/users", userRouter);
app.use("/api/outcomes", outcomeRouter);
app.use("/api/measures", measureRouter);
app.use("/api/cycles", cycleRouter);
app.use("/api/rubrics", rubricRouter);
app.use("/api/evaluators", evaluatorRouter);
app.use("/api/coordinators", coordinatorRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(port, () => {
  console.log("Server listening to port ", port);
});
