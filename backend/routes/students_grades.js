"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dbconnection_1 = __importDefault(require("../dbconnection"));
var router = express_1.default.Router();
router.get('/students/grades', function (req, res) {
    if (req.session.logged) {
        var queryMajors = "SELECT majors.major_name, students_majors.semnumber FROM majors\n                             JOIN students_majors ON majors.major_id = students_majors.major_id\n                             JOIN students ON students.student_id = students_majors.student_id\n                             WHERE students.student_email = \"" + req.session.logged[6].value + "\";";
        var error_1 = null;
        dbconnection_1.default.query(queryMajors, function (err, result) {
            if (err) {
                error_1 = 'There has been problem with the database occured, please try again later.';
            }
            var splitArray = [];
            if (req.query.data) {
                var holdArray = [];
                for (var i = 0; i < req.query.data.length; i++) {
                    if (i % 8 === 0 && i > 0) {
                        splitArray.push(holdArray);
                        holdArray = [];
                    }
                    holdArray.push(req.query.data[i]);
                }
                splitArray.push(holdArray);
            }
            res.status(200).render('grades', {
                student_data: req.session.logged,
                error: error_1,
                majors_data: result,
                info_error: req.query.error,
                info_data: splitArray
            });
        });
    }
    else {
        res.status(401).redirect('/students/signin');
    }
});
router.get('/students/info', function (req, res) {
    if (req.session.logged) {
        var select = "SELECT s_m.semnumber FROM majors m\n                        JOIN students_majors s_m ON m.major_id = s_m.major_id\n                        JOIN students s ON s.student_id = s_m.student_id\n                        WHERE m.major_name = ? AND s.student_email = \"" + req.session.logged[6].value + "\"";
        dbconnection_1.default.query(select, ["" + req.query.major], function (err, result) {
            if (err) {
                res.status(404).redirect("/students/grades?error=" + encodeURIComponent('There has been problem with the database occured, please try again later.'));
            }
            else {
                if (result[0].semnumber < req.query.semester) {
                    res.status(404).redirect("/students/grades?error=" + encodeURIComponent('You have not reached that semester yet.'));
                }
                else {
                    var select2 = "SELECT m.major_name, m_s.semnumber, s.subject_name, s.subject_type,\n                                     t.teacher_name, t.teacher_lastname, t.teacher_degree\n                                     FROM majors m, majors_subjects m_s, subjects s, teachers t, teachers_subjects t_s\n                                     WHERE m_s.major_id = m.major_id AND s.subject_id = m_s.subject_id\n                                     AND t.teacher_id = t_s.teacher_id AND s.subject_id = t_s.subject_id\n                                     AND m.major_name = ? AND m_s.semnumber = ?;\n                                     SELECT s_s.grade, su.subject_name FROM students_subjects s_s\n                                     JOIN students s ON s.student_id = s_s.student_id\n                                     JOIN subjects su ON su.subject_id = s_s.subject_id\n                                     WHERE s_s.semnumber = ? AND s.student_email=?";
                    dbconnection_1.default.query(select2, ["" + req.query.major, req.query.semester, req.query.semester, "" + req.session.logged[6].value], function (err2, result2) {
                        if (err2) {
                            res.status(404).redirect("/students/grades?error=" + encodeURIComponent('There has been problem with the database occured, please try again later.'));
                        }
                        else {
                            var data = '';
                            if (result2[1].length > 0) {
                                var _loop_1 = function (i) {
                                    var subject = result2[1].find(function (subject) { return subject.subject_name === result2[0][i].subject_name; });
                                    var grade = void 0;
                                    if (typeof subject === "undefined") {
                                        grade = "Not assigned";
                                    }
                                    else {
                                        grade = subject.grade;
                                    }
                                    result2[0][i] = __assign(__assign({}, result2[0][i]), { grade: grade });
                                };
                                for (var i = 0; i < result2[0].length; i++) {
                                    _loop_1(i);
                                }
                            }
                            else {
                                for (var i = 0; i < result2[0].length; i++) {
                                    result2[0][i] = __assign(__assign({}, result2[0][i]), { grade: "Not assigned" });
                                }
                            }
                            for (var _i = 0, _a = result2[0]; _i < _a.length; _i++) {
                                var obj = _a[_i];
                                for (var key in obj) {
                                    data += "data=" + encodeURIComponent(obj[key]) + "&";
                                }
                            }
                            res.status(200).redirect("/students/grades?" + data);
                        }
                    });
                }
            }
        });
    }
    else {
        res.status(401).redirect('/students/signin');
    }
});
exports.default = router;
