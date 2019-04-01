const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateMeasureInput(data) {
  let errors = {};

  data.measureDescription = !isEmpty(data.measureDescription)
    ? data.measureDescription.trim()
    : "";
  data.projectedValue = !isEmpty(data.projectedValue)
    ? data.projectedValue.trim()
    : "";
  data.projectedStudentNumber = !isEmpty(data.projectedStudentNumber)
    ? data.projectedStudentNumber.trim()
    : "";
  data.course = !isEmpty(data.course) ? data.course.trim() : "";
  data.toolTitle = !isEmpty(data.toolTitle) ? data.toolTitle.trim() : "";

  if (Validator.isEmpty(data.measureDescription)) {
    errors.measureDescription =
      "Performance Measure Description Field is required";
  }

  if (Validator.isEmpty(data.projectedValue)) {
    errors.projectedValue = "Projected Value cannot be empty";
  } else if (!Validator.isInt(data.projectedValue, { min: 0, max: 100 })) {
    errors.projectedValue =
      "Projected Value should be a number between 0 and 100";
  } else {
    data.projectedValue = parseFloat(data.projectedValue);
  }

  if (Validator.isEmpty(data.projectedStudentNumber)) {
    errors.projectedStudentNumber =
      "Projected Student Number field cannot be empty";
  } else if (
    !Validator.isInt(data.projectedStudentNumber, { min: 0, max: 100 })
  ) {
    errors.projectedStudentNumber =
      "Projected Student Number should be a number between 0 and 100";
  } else {
    data.projectedStudentNumber = parseFloat(data.projectedStudentNumber);
  }

  if (Validator.isEmpty(data.toolTitle)) {
    errors.toolTitle = "Tool Name Cannot be Empty";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
