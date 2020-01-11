"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var hbs_1 = __importDefault(require("hbs"));
var dbconnection_1 = __importDefault(require("./dbconnection"));
var body_parser_1 = __importDefault(require("body-parser"));
var sendEmail_1 = __importDefault(require("./sendEmail"));
var express_session_1 = __importDefault(require("express-session"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var server = express_1.default();
var port = process.env.PORT;
var errorMessage = null;
var majors = [];
dbconnection_1.default.getConnection(function (error, connection) {
    if (error)
        errorMessage = 'Unable to connect to the database, please try again later.';
    else {
        connection.query('SELECT major_name FROM majors', function (error, result) {
            if (error)
                errorMessage = 'Sorry for any issues, we couldn\'t load our university majors for you, please try again later.';
            else {
                result.forEach(function (value) {
                    majors.push(value.major_name);
                });
            }
            connection.release();
        });
    }
});
server.use(express_session_1.default({ secret: process.env.SECRET_SESSION_KEY, resave: false, saveUninitialized: false, maxAge: 86400000 * 7 })); //Date.now() +
server.use(cookie_parser_1.default());
server.use(body_parser_1.default.urlencoded({ extended: false }));
server.use(body_parser_1.default.json());
server.set('views', path_1.default.join(__dirname, '../frontend/templates/views'));
server.set('view engine', 'hbs');
hbs_1.default.registerPartials(path_1.default.join(__dirname, '../frontend/templates/partials'));
server.use(express_1.default.static(path_1.default.join(__dirname, '../frontend/public')));
server.get('', function (req, res) {
    res.status(200).render('index', {
        errorMessage: errorMessage,
        majors: majors
    });
});
server.get('/students', function (req, res) {
    if (req.session.logged) {
        res.status(401).redirect('/students/panel');
    }
    else {
        res.status(200).render('students');
    }
});
server.get('/students/signup', function (req, res) {
    if (req.session.logged) {
        res.status(401).redirect('/students/panel');
    }
    else {
        res.status(200).render('signup', {
            year: new Date().getFullYear() - 20,
            maxYear: new Date().getFullYear() - 18,
            minYear: new Date().getFullYear() - 70,
            errorMessage: errorMessage,
            majors: majors,
            query: req.query.queryy,
            pin: req.query.pin,
            phone: req.query.phone,
            email: req.query.email,
            success: req.query.success || ''
        });
    }
});
server.post('/students/registration', function (req, res) {
    var select = "SELECT * FROM students WHERE student_PIN=?;\n                    SELECT * FROM students WHERE student_phonenumber=?;\n                    SELECT * FROM students WHERE student_email=?";
    dbconnection_1.default.query(select, [req.body.pin, req.body.phone, req.body.email], function (error, result) { return __awaiter(void 0, void 0, void 0, function () {
        var string, hash, user_1, data, insert, e_1, pin, phone, email, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!error) return [3 /*break*/, 1];
                    string = encodeURIComponent('Unable to connect to the database, please try again later.');
                    res.status(404).redirect("/students/signup?queryy=" + string);
                    return [3 /*break*/, 7];
                case 1:
                    if (!(result[0].length === 0 && result[1].length === 0 && result[2].length === 0)) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, bcryptjs_1.default.hash(req.body.password, 10)];
                case 3:
                    hash = _a.sent();
                    req.body.password = hash;
                    user_1 = req.body;
                    data = {
                        student_id: null, student_name: user_1.name.toLowerCase(), student_lastname: user_1.lastname.toLowerCase(),
                        student_sex: user_1.sex, student_PIN: user_1.pin, student_birthdate: user_1.birthdate,
                        student_phonenumber: user_1.phone, student_email: user_1.email, student_zipcode: user_1.zipcode,
                        student_location: user_1.location.toLowerCase(), student_apartmentnumber: user_1.apartment,
                        student_street: user_1.street.toLowerCase(), student_password: user_1.password
                    };
                    insert = "INSERT INTO students SET ?";
                    dbconnection_1.default.query(insert, data, function (err) {
                        if (err) {
                            res.status(500).redirect("/students/signup?queryy=\n                            " + encodeURIComponent('We weren\'t able to create your account. Please try again later.'));
                        }
                        else {
                            sendEmail_1.default.sendWelcomeMessage(user_1.email, user_1.name);
                            sendEmail_1.default.sendDecisionMessage(user_1.name, user_1.lastname, user_1.pin, process.env.DECISION_KEY, user_1.email, user_1.major);
                            res.status(201).redirect("/students/signup?success=" + encodeURIComponent("We sent you an welcome email to your mailbox. Check it out. \n                            It is possible that our email got into spam folder."));
                        }
                    });
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    res.status(404).redirect("/students/signup?queryy=\n                    " + encodeURIComponent('We weren\'t able to encrypt your password. Please try again later.'));
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    pin = '', phone = '', email = '', query = '';
                    if (result[0].length > 0) {
                        query = encodeURIComponent(' ');
                        pin = encodeURIComponent('This personal identity number already exists in the database.');
                    }
                    if (result[1].length > 0) {
                        query = encodeURIComponent(' ');
                        phone = encodeURIComponent('This phone number already exists in the database.');
                    }
                    if (result[2].length > 0) {
                        query = encodeURIComponent(' ');
                        email = encodeURIComponent('This email already exists in the database.');
                    }
                    res.status(403).redirect("/students/signup?queryy=" + query + "&pin=" + pin + "&phone=" + phone + "&email=" + email);
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); });
});
server.get('/students/acception', function (req, res) {
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
server.get('/students/rejection', function (req, res) {
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
server.get('/students/signin', function (req, res) {
    if (req.session.logged) {
        res.status(401).redirect('/students/panel');
    }
    else {
        res.status(200).render('signin', {
            error: req.query.error,
            errorMessage: errorMessage
        });
    }
});
server.post('/students/login', function (req, res) {
    var select = "SELECT * FROM students WHERE student_email=? AND student_accepted='YES'";
    dbconnection_1.default.query(select, [req.body.email], function (err, result) { return __awaiter(void 0, void 0, void 0, function () {
        var match, date, dateOfBirth, sex, student, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!err) return [3 /*break*/, 1];
                    throw 'Unable to connect to the database, please try again later.';
                case 1:
                    if (!(result.length === 0)) return [3 /*break*/, 2];
                    throw 'Email or password is incorrect';
                case 2: return [4 /*yield*/, bcryptjs_1.default.compare(req.body.password, result[0].student_password)];
                case 3:
                    match = _a.sent();
                    if (!match) {
                        throw 'Email or password is incorrect';
                    }
                    else {
                        date = new Date(result[0].student_birthdate);
                        dateOfBirth = date.toLocaleDateString();
                        sex = result[0].student_sex === 'M' ? 'Man' : 'Woman';
                        student = [
                            { key: 'Name', value: result[0].student_name },
                            { key: 'Last name', value: result[0].student_lastname },
                            { key: 'Sex', value: sex },
                            { key: 'Personal identity number', value: result[0].student_PIN },
                            { key: 'Date of birth', value: dateOfBirth },
                            { key: 'Phone number', value: result[0].student_phonenumber },
                            { key: 'Email', value: result[0].student_email },
                            { key: 'Postal code', value: result[0].student_zipcode },
                            { key: 'Living place', value: result[0].student_location },
                            { key: 'Apartment/home number', value: result[0].student_apartmentnumber },
                            { key: 'Street', value: result[0].student_street }
                        ];
                        req.session.logged = student;
                        res.status(200).redirect('/students/panel');
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    res.status(404).redirect("/students/signin?error=" + encodeURIComponent(error_1));
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); });
});
server.get('/students/panel', function (req, res) {
    if (req.session.logged) {
        res.status(200).render('panel', {
            student_data: req.session.logged
        });
    }
    else {
        res.status(401).redirect('/students/signup');
    }
});
server.get('/students/grades', function (req, res) {
    if (req.session.logged) {
        var queryMajors = "SELECT majors.major_name, students_majors.semnumber FROM majors\n        JOIN students_majors ON majors.major_id = students_majors.major_id\n        JOIN students ON students.student_id = students_majors.student_id\n        WHERE students.student_email = \"" + req.session.logged[6].value + "\"";
        dbconnection_1.default.query(queryMajors, function (err, result) {
            if (err) {
                res.send({ error: 'Error' });
            }
            else {
                res.send(result);
            }
        });
        res.status(200).render('grades', {
            student_data: req.session.logged
        });
    }
    else {
        res.status(401).redirect('/students/signup');
    }
});
server.listen(port, function () {
    console.log("Server running on port " + port);
});
