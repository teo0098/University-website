"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var sendEmail_1 = __importDefault(require("../sendEmail"));
var router = express_1.default.Router();
router.get('/contact', function (req, res) {
    var email = "";
    if (req.session.logged) {
        email = req.session.logged[6].value;
    }
    res.status(200).render('contact', {
        email: email,
        success: req.query.success
    });
});
router.post('/contact/message', function (req, res) {
    sendEmail_1.default.sendContactMessage(req.body.email, req.body.message.trim());
    res.status(200).redirect("/contact?success=" + encodeURIComponent("Message has been sent successfully"));
});
exports.default = router;
