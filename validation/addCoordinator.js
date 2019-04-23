const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateAddCoordinateInput(data) {
  const errors = {};
  data.coordinatorEmail = !isEmpty(data.coordinatorEmail)
    ? data.coordinatorEmail.trim()
    : "";

  if (Validator.isEmpty(data.coordinatorEmail)) {
    errors.coordinatorEmail = "Coordinator Email field cannot be empty";
  } else if (!Validator.isEmail(data.coordinatorEmail)) {
    errors.coordinatorEmail = "Invalid Email";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
