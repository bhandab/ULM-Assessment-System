if (process.env.NODE_ENV === "production") {
  module.exports = {
    secretOrkey: process.env.SECRET
  };
} else {
  require("dotenv").config();
  module.exports = {
    secretOrkey: process.env.SECRET
  };
}
