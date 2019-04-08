const Validator = require("validator");
const isEmpty = require("./isEmpty");

const validateCSVStudents = rows => {
  const dataRows = rows.slice(1, rows.length);
  for (let i = 0; i < dataRows.length; i++) {
    const rowError = validateCSVStudentsRow(dataRows[i]);
    if (rowError) {
      return `${rowError} on Row ${i + 1}`;
    }
  }

  return;
};

const validateCSVStudentsRow = row => {
  if (row.length > 5) {
    return "Invalid Row";
  } else {
    if (isEmpty(row[0])) {
      return "Empty Name Field";
    } else if (isEmpty(row[1])) {
      return "Empty Email Field";
    } else if (!Validator.isEmail(row[1])) {
      return "Invalid Email Field";
    } else if (isEmpty(row[2])) {
      return "Empty CWID Field";
    }
  }

  return;
};

module.exports = { validateCSVStudents, validateCSVStudentsRow };
