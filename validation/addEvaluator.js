const Validator = require('validator')
const isEmpty = require('./isEmpty')

module.exports = function validateAddEvaluatorInput(data){
    const errors = {}
    data.evaluatorEmail = !isEmpty(data.evaluatorEmail) ? data.evaluatorEmail.trim() : ""

    if(Validator.isEmpty(data.evaluatorEmail)){
        errors.evaluatorEmail = "Evaluator Email field cannot be empty"
    }
    else if(!Validator.isEmail(data.evaluatorEmail)){
        errors.evaluatorEmail = "Invalid Email"
    }

    return{
        errors,
        isValid:isEmpty(errors)
    }
}