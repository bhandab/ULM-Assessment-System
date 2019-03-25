const Validator = require('validator');
const isEmpty = require('./isEmpty')


module.exports = function validateLoginInput(data){

    let errors = {};

    //Convert empty fields to an empty string so we can use validator functions as validator can validate null values

    data.email = !isEmpty(data.email) ? data.email.trim() : ""
    data.password = !isEmpty(data.password) ? data.password.trim() : ""

    //Email Validations
    if(Validator.isEmpty(data.email)){
        errors.email = "Email field is required"
    }
    else if(!Validator.isEmail(data.email)){
        errors.email = "Invalid Email"
    }
    
    //Password field validations
    if (Validator.isEmpty(data.password)){
        errors.password = "Password field is required"
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }

}