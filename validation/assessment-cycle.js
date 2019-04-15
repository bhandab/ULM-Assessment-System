const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateCycleInput(data) {
  const errors = {};
  data.cycleTitle = !isEmpty(data.cycleTitle) ? data.cycleTitle.trim() : "";

  //Validate for empty cycle title
  if (Validator.isEmpty(data.cycleTitle)) {
    errors.cycleTitle = "Assessment Cycle Title field is required";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
