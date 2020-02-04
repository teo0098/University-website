"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dbconnection_1 = __importDefault(require("../dbconnection"));
var sendEmail_1 = __importDefault(require("../sendEmail"));
var router = express_1.default.Router();
router.get('/students/acception', function (req, res) {
    if (req.query.decision === process.env.DECISION_KEY) {
        var update = "UPDATE students SET student_accepted='YES' WHERE student_PIN=?";
        dbconnection_1.default.query(update, ["" + req.query.pin], function (err1) {
            if (err1) {
                res.status(404).send({ error: 'Not updated' });
            }
            else {
                var selectID = "SELECT * FROM students WHERE student_PIN=?;\n                          SELECT * FROM majors WHERE major_name=?";
                dbconnection_1.default.query(selectID, [req.query.pin, req.query.major], function (err2, result) {
                    if (err2) {
                        res.status(404).send({ error: 'No id selected' });
                    }
                    else {
                        var insert = "INSERT INTO students_majors VALUES(NULL, " + result[1][0].major_id + ", " + result[0][0].student_id + ", 1)";
                        dbconnection_1.default.query(insert, function (err3) {
                            if (err3) {
                                res.status(404).send({ error: 'Not inserted' });
                            }
                            else {
                                sendEmail_1.default.sendAcceptionMessage(req.query.email, req.query.name);
                                res.status(201).send({ success: 'Accepted' });
                            }
                        });
                    }
                });
            }
        });
    }
    else {
        res.status(401).redirect('/students/signup');
    }
});
router.get('/students/rejection', function (req, res) {
    if (req.query.decision === process.env.DECISION_KEY) {
        var deletee = "DELETE FROM students WHERE student_PIN=?";
        dbconnection_1.default.query(deletee, ["" + req.query.pin], function (err) {
            if (err) {
                res.status(404).send({ error: 'Not deleted' });
            }
            else {
                sendEmail_1.default.sendRejectionMessage(req.query.email, req.query.name);
                res.status(201).send({ success: 'Deleted' });
            }
        });
    }
    else {
        res.status(401).redirect('/students/signup');
    }
});
exports.default = router;
