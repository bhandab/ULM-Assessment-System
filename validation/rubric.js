const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateRubricStructureInput(data) {
  let errors = {};

  data.rows = !isEmpty(data.rows) ? data.rows.trim() : "";
  data.columns = !isEmpty(data.columns) ? data.columns.trim() : "";
  data.rubricName = !isEmpty(data.rubricName) ? data.rubricName.trim() : "";
  data.weighted = !isEmpty(data.weighted) ? data.weighted : "";

  if (Validator.isEmpty(data.weighted)) {
    errors.weighted = "Weighted Field Cannot be empty";
  } else if (!Validator.isBoolean) {
    errors.weighted = "Weighted Field Should be a boolean";
  }
  else{
    data.weighted = Validator.toBoolean(data.weighted)
  }

  if (Validator.isEmpty(data.rows)) {
    errors.rows = "No. of rows field cannot be empty";
  } else if (!Validator.isInt(data.rows, { min: 2, max: 20 })) {
    errors.rows = "Please enter a number between 3 and 10 inclusive";
  } else {
    data.rows = parseInt(data.rows);
  }

  if (Validator.isEmpty(data.columns)) {
    errors.columns = "No. of columns field cannot be empty";
  } else if (!Validator.isInt(data.columns, { min: 2, max: 20 })) {
    errors.columns = "Please enter a number between 3 and 10 inclusive";
  } else {
    data.columns = parseInt(data.columns);
  }

  data.scales.forEach((scale, index) => {
    console.log(scale);
    console.log(index);
    if (isEmpty(scale.scaleValue)) {
      errors.scales = "Scale Value Cannot be empty";
    } else if (!Validator.isInt(scale.scaleValue.trim(), { min: 0 })) {
      errors.scales =
        "Scale Value should be a number and cannot be less than 0";
    } else {
      data.scales[index].scaleValue = parseInt(scale.scaleValue.trim());
      data.scales[index].scaleDesc = !isEmpty(scale.scaleDesc)
        ? scale.scaleDesc.trim()
        : "";
    }
  });

  if (Validator.isEmpty(data.rubricName)) {
    errors.rubricName = "Rubric Title field cannot be empty";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
