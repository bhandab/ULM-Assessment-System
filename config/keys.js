require("dotenv").config();

//if (process.env.NODE_ENV === "production") {
module.exports = {
  secretOrkey: process.env.SECRET
};
//}
// else {
//   module.exports = {
//     secretOrkey: "secret"
//   };
// }
