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
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var sendEmail_1 = __importDefault(require("./sendEmail"));
var server = express_1.default();
var port = process.env.PORT;
var errorMessage = null;
var majors = [];
dbconnection_1.default.getConnection(function (error, connection) {
    if (error)
        errorMessage = 'Unable to connect to the database, please try again later';
    else {
        connection.query('SELECT major_name FROM majors', function (error, result) {
            if (error)
                errorMessage = 'Sorry for any issues, we couldn\'t load our university majors for you, please try again later';
            else {
                result.forEach(function (value) {
                    majors.push(value.major_name);
                });
            }
            connection.release();
        });
    }
});
server.use(body_parser_1.default.urlencoded({ extended: false }));
server.use(body_parser_1.default.json());
server.set('views', path_1.default.join(__dirname, '../frontend/templates/views'));
server.set('view engine', 'hbs');
hbs_1.default.registerPartials(path_1.default.join(__dirname, '../frontend/templates/partials'));
server.use(express_1.default.static(path_1.default.join(__dirname, '../frontend/public')));
server.get('', function (req, res) {
    res.render('index', {
        errorMessage: errorMessage,
        majors: majors
    });
});
server.get('/students', function (req, res) {
    res.render('students');
});
server.get('/students/signup', function (req, res) {
    res.render('signup', {
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
});
server.post('/students/registration', function (req, res) {
    var select = "SELECT * FROM students WHERE student_PIN=?;\n                    SELECT * FROM students WHERE student_phonenumber=?;\n                    SELECT * FROM students WHERE student_email=?";
    dbconnection_1.default.query(select, [req.body.pin, req.body.phone, req.body.email], function (error, result) {
        if (error) {
            var string = encodeURIComponent('Unable to connect to the database, please try again later');
            res.redirect("/students/signup?queryy=" + string);
        }
        else {
            if (result[0].length === 0 && result[1].length === 0 && result[2].length === 0) {
                jsonwebtoken_1.default.sign({ user: req.body }, process.env.SECRET_KEY_SIGNED_UP, { expiresIn: '10m' });
                sendEmail_1.default.sendConfirmMessage(req.body.email, req.body.name);
                res.redirect("/students/signup?success=" + encodeURIComponent('We sent you an confirming email to your mailbox. Please confirm your email in 24 hours') + ". It is possible that our email got into spam folder");
            }
            else {
                var pin = '', phone = '', email = '', query = '';
                if (result[0].length > 0) {
                    query = encodeURIComponent(' ');
                    pin = encodeURIComponent('This personal identity number already exists in the database');
                }
                if (result[1].length > 0) {
                    query = encodeURIComponent(' ');
                    phone = encodeURIComponent('This phone number already exists in the database');
                }
                if (result[2].length > 0) {
                    query = encodeURIComponent(' ');
                    email = encodeURIComponent('This email already exists in the database');
                }
                res.redirect("/students/signup?queryy=" + query + "&pin=" + pin + "&phone=" + phone + "&email=" + email);
            }
        }
    });
});
server.get('/students/confirmation', function (req, res) {
    res.render('confirmation', {
        name: encodeURIComponent(req.query.name)
    });
});
server.listen(port, function () {
    console.log("Server running on port " + port);
});
