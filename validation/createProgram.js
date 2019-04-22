const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateCreateProgramInput(data) {
  let errors = {};
  data.programName = !isEmpty(data.programName) ? data.programName.trim() : "";
  if (Validator.isEmpty(data.programName)) {
    errors.programName = "Program Name field cannot be empty";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
