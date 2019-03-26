const Validator = require('validator');
const isEmpty = require('./isEmpty')

module.exports = function validateRubricStructureInput(data){
    let errors = {}

    data.rows = !isEmpty(data.rows) ? data.rows.trim() : ""
    data.columns = !isEmpty(data.columns) ? data.columns.trim() : ""
    data.rubricName = !isEmpty(data.rubricName) ? data.rubricName.trim(): ""

    if(Validator.isEmpty(data.rows)){
        errors.rows = "No. of rows field cannot be empty"
    }
    else if(!Validator.isInt(data.rows,{min:3,max:10})){
        errors.rows = "Please enter a number between 3 and 10 inclusive"
    }
    else{
        data.rows = parseInt(data.rows)
    }

    if(Validator.isEmpty(data.columns)){
        errors.columns = "No. of columns field cannot be empty"
    }
    else if(!Validator.isInt(data.columns,{min:3,max:10})){
        errors.columns = "Please enter a number between 3 and 10 inclusive"
    }
    else{
        data.columns = parseInt(data.columns)
    }

    if(Validator.isEmpty(data.rubricName)){
        errors.rubricName = "Rubric Title field cannot be empty"
    }
    

    return {
        errors,
        isValid:isEmpty(errors)
    }

}