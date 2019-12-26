const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
const msg = {
  to: 'teodor.tkaczyk98@gmail.com',
  from: 'test@example.com',
  subject: 'Sending with Twilio SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
sgMail.send(msg);