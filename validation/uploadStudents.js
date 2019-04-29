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
      return "Empty First Name Field";
    } else {
      row[0] = row[0].trim();
    }
    if (isEmpty(row[1].trim())) {
      return "Empty Last Name Field";
    } else {
      row[1] = row[1].trim();
    }
    if (isEmpty(row[2].trim())) {
      return "Empty Email Field";
    } else if (!Validator.isEmail(row[2].trim())) {
      return "Invalid Email Field";
    } else {
      row[2] = row[2].trim();
    }
    if (isEmpty(row[3].trim())) {
      row[3] = "";
    } else {
      row[3] = row[3].trim();
    }
  }

  return;
};

const validateCSVTestPassStudents = rows => {
  const dataRows = rows.slice(1, rows.length);

  for (let i = 0; i < dataRows.length; i++) {
    const rowError = validateCSVStudentsTestPassRow(dataRows[i]);
    if (rowError) {
      return `${rowError} on Row ${i + 1}`;
    }
    rows[i] = dataRows[i];
  }
  return;
};

const validateCSVStudentsTestPassRow = row => {
  if (row.length > 6) {
    return "Invalid Row";
  } else {
    if (isEmpty(row[0].trim())) {
      return "Empty Name Field";
    } else {
      row[0] = row[0].trim();
    }
    if (isEmpty(row[1].trim())) {
      return "Empty Last Name Field";
    } else {
      row[1] = row[1].trim();
    }
    if (isEmpty(row[2].trim())) {
      return "Empty Email Field";
    } else if (!Validator.isEmail(row[2].trim())) {
      return "Invalid Email Field";
    } else {
      row[2] = row[2].trim();
    }
    if (isEmpty(row[3].trim())) {
      row[3] = "";
    } else {
      row[3] = row[3].trim();
    }
    if (isEmpty(row[4].trim())) {
      return "Empty Score Field";
    } else {
      if (
        row[4].trim().toLowerCase() !== "pass" ||
        row[4].trim().toLowerCase() !== "fail"
      ) {
        return "Invalid Score Field";
      } else {
        if (row[4].trim().toLowerCase() === "pass") {
          row[4] = true;
        } else {
          row[4] = false;
        }
      }
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
      return "Empty Last Name Field";
    } else {
      row[1] = row[1].trim();
    }
    if (isEmpty(row[2].trim())) {
      return "Empty Email Field";
    } else if (!Validator.isEmail(row[2].trim())) {
      return "Invalid Email Field";
    } else {
      row[2] = row[2].trim();
    }
    if (isEmpty(row[3].trim())) {
      row[3] = "";
    } else {
      row[3] = row[3].trim();
    }
    if (isEmpty(row[4].trim())) {
      return "Empty Score Field";
    } else {
      if (!Validator.isFloat(row[4].trim())) {
        return "Invalid Score Field";
      } else {
        row[4] = Validator.toFloat(row[4]);
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
