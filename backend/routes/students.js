"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
router.get('/students', function (req, res) {
    if (req.session.logged) {
        res.status(401).redirect('/students/panel');
    }
    else {
        res.status(200).render('students');
    }
});
exports.default = router;
