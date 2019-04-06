const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateMeasureInput(data) {
  let errors = {};

  data.projectedStudentNumber = !isEmpty(data.projectedStudentNumber)
    ? data.projectedStudentNumber.trim()
    : "";
  data.studentNumberOperator = !isEmpty(data.studentNumberOperator)
    ? data.studentNumberOperator.trim()
    : "";

  data.course = !isEmpty(data.course) ? data.course.trim() : "";

  data.projectedValue = !isEmpty(data.projectedValue)
    ? data.projectedValue.trim()
    : "";
  data.valueOperator = !isEmpty(data.valueOperator)
    ? data.valueOperator.trim()
    : "";

  data.toolType = !isEmpty(data.toolType) ? data.toolType.trim() : "";
  data.toolTitle = !isEmpty(data.toolTitle) ? data.toolTitle.trim() : "";

  if (Validator.isEmpty(data.studentNumberOperator)) {
    errors.studentNumberOperator =
      "Please choose the scale for after number of students";
  }

  if (Validator.isEmpty(data.projectedStudentNumber)) {
    errors.projectedStudentNumber =
      "Projected Student Number field cannot be empty";
  } else if (
    !Validator.isFloat(data.projectedStudentNumber, { min: 0, max: 100 })
  ) {
    errors.projectedStudentNumber =
      "Projected Student Number should be a number between 0 and 100";
  } else {
    data.projectedStudentNumber = parseFloat(data.projectedStudentNumber);
  }
<<<<<<< HEAD

  if (data.toolType !== 'rubric'){
  if (Validator.isEmpty(data.valueOperator)) {
    errors.valueOperator =
      "Value Scale cannot be empty, Please choose a value scale from drop  down after number of students";
=======
  if (toolType !== "rubric") {
    if (Validator.isEmpty(data.valueOperator)) {
      errors.valueOperator =
        "Value Scale cannot be empty, Please choose a value scale from drop  down after number of students";
    }
>>>>>>> 8a3bb10d35be9a56e486e5e84f08be1e3a843562
  }
}

  if (Validator.isEmpty(data.projectedValue)) {
    errors.projectedValue = "Projected Value cannot be empty";
  } else if (!Validator.isFloat(data.projectedValue, { min: 0, max: 100 })) {
    errors.projectedValue =
      "Projected Value should be a number between 0 and 100";
  } else {
    data.projectedValue = parseFloat(data.projectedValue);
  }

  if (Validator.isEmpty(data.toolType)) {
    errors.toolType =
      "Tool type cannot be empty, Please select an option from dropdown";
  }
  if (Validator.isEmpty(data.toolTitle)) {
    errors.toolTitle = "Tool Name Cannot be Empty";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
