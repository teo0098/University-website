"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var hbs_1 = __importDefault(require("hbs"));
var dbconnection_1 = __importDefault(require("./dbconnection"));
var body_parser_1 = __importDefault(require("body-parser"));
var express_session_1 = __importDefault(require("express-session"));
var students_1 = __importDefault(require("./routes/students"));
var students_registration_1 = __importDefault(require("./routes/students_registration"));
var students_decision_1 = __importDefault(require("./routes/students_decision"));
var students_login_1 = __importDefault(require("./routes/students_login"));
var students_panel_1 = __importDefault(require("./routes/students_panel"));
var students_grades_1 = __importDefault(require("./routes/students_grades"));
var students_settings_1 = __importDefault(require("./routes/students_settings"));
var students_logout_1 = __importDefault(require("./routes/students_logout"));
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
server.use(body_parser_1.default.urlencoded({ extended: false }));
server.use(body_parser_1.default.json());
server.set('views', path_1.default.join(__dirname, '../frontend/templates/views'));
server.set('view engine', 'hbs');
hbs_1.default.registerPartials(path_1.default.join(__dirname, '../frontend/templates/partials'));
server.use(express_1.default.static(path_1.default.join(__dirname, '../frontend/public')));
server.use(students_1.default);
server.use(students_registration_1.default);
server.use(students_decision_1.default);
server.use(students_login_1.default);
server.use(students_panel_1.default);
server.use(students_grades_1.default);
server.use(students_settings_1.default);
server.use(students_logout_1.default);
server.get('', function (req, res) {
    res.status(200).render('index', {
        errorMessage: errorMessage,
        majors: majors
    });
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
server.get('/students/signin', function (req, res) {
    if (req.session.logged) {
        res.status(401).redirect('/students/panel');
    }
    else {
        res.status(200).render('signin', {
            error: req.query.error,
            errorMessage: errorMessage,
            success: req.query.success
        });
    }
});
server.get('*', function (req, res) {
    res.status(404).redirect('/');
});
server.listen(port, function () {
    console.log("Server running on port " + port);
});
