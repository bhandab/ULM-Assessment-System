const sgMail = require("@sendgrid/mail");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const invite = (invitorEmail, invitorName, inviteeEmail) => {
  const msg = {
    to: inviteeEmail,
    from: invitorEmail,
    subject: "Invitation to Join ULM Evaluation App",
    html: `<p>Hello, My name is ${invitorName}. Please click this <a href = 'https://ulm-assessment-system.herokuapp.com/register'>Evaluator Registration Link</a> to sign up and and evaluate students</p>`
  };
  sgMail.send(msg);
};

module.exports = { invite };
