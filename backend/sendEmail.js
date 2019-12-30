"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
var sendWelcomeMessage = function (email, name) {
    var message = {
        to: email,
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Welcome new student',
        html: "<h1>Welcome " + name + "</h1>\n                <h3>We are thankful for confirming your registration.\n                We will let you know about your application soon by sending an email to your mailbox. Stay tuned.</h3>"
    };
    mail_1.default.send(message);
};
var sendDecisionMessage = function (name, lastname, pin, decision, email) {
    var message = {
        to: 'teodor.tkaczyk98@gmail.com',
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Application decision',
        html: "<h1>What to do with this user?</h1>\n                <h3>Name: " + name + "</h3>\n                <h3>Last name: " + lastname + "</h3>\n                <h3>Personal ID: " + pin + "</h3>\n                <a href=\"https://teo-university-app.herokuapp.com/students/acception?decision=" + decision + "\n                &email=" + email + "&name=" + name + "\">Accept student</a>\n                <a href=\"https://teo-university-app.herokuapp.com/students/rejection?decision=" + decision + "\n                &email=" + email + "&name=" + name + "&pin=" + pin + "\">Reject student</a>"
    };
    mail_1.default.send(message);
};
var sendAcceptionMessage = function (email, name) {
    var message = {
        to: email,
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Decision',
        html: "<h1>Welcome " + name + "</h1>\n                <h3>We want to inform you that you passed our requirements and we are looking forward to see you at our academy.</h3>"
    };
    mail_1.default.send(message);
};
var sendRejectionMessage = function (email, name) {
    var message = {
        to: email,
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Decision',
        html: "<h1>Welcome " + name + "</h1>\n                <h3>We want to inform you that you didn't pass our requirements. We hope you won't give up and try another time. Stay positive.</h3>"
    };
    mail_1.default.send(message);
};
exports.default = {
    sendWelcomeMessage: sendWelcomeMessage,
    sendDecisionMessage: sendDecisionMessage,
    sendAcceptionMessage: sendAcceptionMessage,
    sendRejectionMessage: sendRejectionMessage
};
