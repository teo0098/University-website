"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
var sendConfirmMessage = function (email, name) {
    var message = {
        to: email,
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Confirm your registration',
        html: "<h1>Welcome " + name + "</h1>\n                <h3>Please confirm your registration process by clicking the link down below</h3>\n                <a href=\"https://teo-university-app.herokuapp.com/students/confirmation?name=" + name + "\">Confirm</a>"
    };
    mail_1.default.send(message);
};
exports.default = {
    sendConfirmMessage: sendConfirmMessage
};
