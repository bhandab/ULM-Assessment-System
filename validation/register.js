const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.firstName = !isEmpty(data.firstName) ? data.firstName.trim() : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName.trim() : "";
  data.email = !isEmpty(data.email) ? data.email.trim() : "";
  data.password = !isEmpty(data.password) ? data.password.trim() : "";
  data.password2 = !isEmpty(data.password2) ? data.password2.trim() : "";
  data.tempCode = !isEmpty(data.tempCode) ? data.tempCode.trim() : "";
  //data.program = !isEmpty(data.program) ? data.program.trim() : "";

  // Name checks
  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = "First Name field is required";
  }
  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = "Last Name field is required";
  }

  //Program Name Checks
  // if (Validator.isEmpty(data.program)) {
  //   errors.program = "Program Name field is required";
  // }

  // Email checks
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  // Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password field is required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }
  if (Validator.isEmpty(data.tempCode)) {
    errors.tempCode =
      "Temporary Code Field Cannot be Empty. Please refer to the email you received for Temporary Code";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
