const Validator = require('validator');
const isEmpty = require('./isEmpty')

module.exports = function validateOutcomeInput(data){
    let errors = {};

    data.outcomeDescription = !isEmpty(data.outcomeDescription) ? data.outcomeDescription.trim() : ""

    if(Validator.isEmpty(data.outcomeDescription)){
        errors.outcomeDescription = "Learning Outcome Description Field is required"
    }
    return{
        errors,
         isValid:isEmpty(errors)
    }
}