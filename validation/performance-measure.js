const Validator = require('validator');
const isEmpty = require('./isEmpty')

module.exports = function validateMeasureInput(data){
    let errors = {};

    data.measureDescription = !isEmpty(data.measureDescription) ? data.measureDescription.trim() : ""

    if(Validator.isEmpty(data.measureDescription)){
        errors.measureDescription = "Performance Measure Description Field is required"
    }
    return{
        errors,
         isValid:isEmpty(errors)
    }
}