"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
router.get('/students/panel', function (req, res) {
    if (req.session.logged) {
        res.status(200).render('panel', {
            student_data: req.session.logged
        });
    }
    else {
        res.status(401).redirect('/students/signin');
    }
});
exports.default = router;
