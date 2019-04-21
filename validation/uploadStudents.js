const Validator = require("validator");
const isEmpty = require("./isEmpty");

const validateCSVStudents = rows => {
  const dataRows = rows.slice(1, rows.length);
  for (let i = 0; i < dataRows.length; i++) {
    const rowError = validateCSVStudentsRow(dataRows[i]);
    if (rowError) {
      return `${rowError} on Row ${i + 1}`;
    }
    rows[i] = dataRows[i];
  }

  return;
};

const validateCSVStudentsRow = row => {
  if (row.length > 5) {
    return "Invalid Row";
  } else {
    if (isEmpty(row[0].trim())) {
      return "Empty Name Field";
    } else {
      row[0] = row[0].trim();
    }
    if (isEmpty(row[1].trim())) {
      return "Empty Email Field";
    } else if (!Validator.isEmail(row[1].trim())) {
      return "Invalid Email Field";
    } else {
      row[1] = row[1].trim();
    }
    if (isEmpty(row[2].trim())) {
      row[2] = "";
    } else {
      row[2] = row[2].trim();
    }
  }

  return;
};

const validateCSVTestStudents = rows => {
  const dataRows = rows.slice(1, rows.length);

  for (let i = 0; i < dataRows.length; i++) {
    const rowError = validateCSVStudentsTestRow(dataRows[i]);
    if (rowError) {
      return `${rowError} on Row ${i + 1}`;
    }
    rows[i] = dataRows[i];
  }
  return;
};

const validateCSVStudentsTestRow = row => {
  if (row.length > 6) {
    return "Invalid Row";
  } else {
    if (isEmpty(row[0].trim())) {
      return "Empty Name Field";
    } else {
      row[0] = row[0].trim();
    }
    if (isEmpty(row[1].trim())) {
      return "Empty Email Field";
    } else if (!Validator.isEmail(row[1].trim())) {
      return "Invalid Email Field";
    } else {
      row[1] = row[1].trim();
    }
    if (isEmpty(row[2].trim())) {
      row[2] = "";
    } else {
      row[2] = row[2].trim();
    }
    if (isEmpty(row[3].trim())) {
      return "Empty Score Field";
    } else {
      if (!Validator.isFloat(row[3].trim())) {
        return "Invalid Score Field";
      } else {
        row[3] = Validator.toFloat(row[3]);
      }
    }
  }

  return;
};

module.exports = {
  validateCSVStudents,
  validateCSVStudentsRow,
  validateCSVStudentsTestRow,
  validateCSVTestStudents
};
