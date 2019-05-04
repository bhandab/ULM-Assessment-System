const sgMail = require("@sendgrid/mail");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const invite = (invitorEmail, invitorName, inviteeEmail, token) => {
  if (invitorName === undefined) {
    invitorName = Admin;
  }
  const msg = {
    to: inviteeEmail,
    from: invitorEmail,
    subject: "Invitation to Join ULM EVALUATION SYSTEM",
    html: `<p>Hello There, <br><br>You have a sign-up invitation from ULM EVALUATION SYSTEM. Please click on this <a href = "https://ulm-assessment-system.herokuapp.com/register">Registration Link</a> and use the temporary code provided belowe to sign-up</p><p>Temporary Code: <strong>${token}</strong><br><br>Thank You!<br>ULM EVALUATION SYSTEM</p>`
  };
  return sgMail.send(msg);
};

module.exports = { invite };
