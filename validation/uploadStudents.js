const Validator = require("validator");
const isEmpty = require("./isEmpty");

const validateCSVStudents = rows => {
  const dataRows = rows.slice(1, rows.length);
  for (let i = 0; i < dataRows.length; i++) {
    const rowError = validateCSVStudentsRow(dataRows[i]);
    if (rowError) {
      return `${rowError} on Row ${i + 1}`;
    }
    rows[i] = dataRows[i]
  }
//  rows = rows
  return;
};

const validateCSVStudentsRow = row => {
  if (row.length > 5) {
    return "Invalid Row";
  } else {
    if (isEmpty(row[0].trim())) {
      return "Empty Name Field";
    }
    else {
      row[0] = row[0].trim()
    }
    if (isEmpty(row[1].trim())) {
      return "Empty Email Field";
    } else if (!Validator.isEmail(row[1].trim())) {
      return "Invalid Email Field";
    }
    else{
      row[1] = row[1].trim()
    }
    if (isEmpty(row[2].trim())) {
      return "Empty CWID Field";
    }
    else{
      row[2] = row[2].trim();
    }
  }

  return;
};

module.exports = { validateCSVStudents, validateCSVStudentsRow };
