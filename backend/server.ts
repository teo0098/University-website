import express from 'express';
import path from 'path';
import hbs from 'hbs';
import connection from './dbconnection';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import email from './sendEmail';

let errorMessage: string | null = null;
let majors: Array<string> = [];
connection.connect((error) => {
    if (error) errorMessage = 'Unable to connect to the database, please try again later';
    else {
        connection.query('SELECT major_name FROM majors', (error, result) => {
            if (error) errorMessage = 'Sorry for any issues, we couldn\'t load our university majors for you, please try again later';
            else {
                result.forEach((value) => {
                    majors.push(value.major_name);
                });
            }
        });
    }
});

const server: express.Application = express();
const port = process.env.PORT;

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.set('views', path.join(__dirname, '../frontend/templates/views'));
server.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, '../frontend/templates/partials'));

server.use(express.static(path.join(__dirname, '../frontend/public')));

server.get('', (req, res) => {
    res.render('index', {
        errorMessage,
        majors
    });
});

server.get('/students', (req, res) => {
    res.render('students');
});

server.get('/students/signup', (req, res) => {
    res.render('signup', {
        year: new Date().getFullYear() - 20,
        maxYear: new Date().getFullYear() - 18,
        minYear: new Date().getFullYear() - 70,
        errorMessage,
        majors,
        query: req.query.queryy,
        pin: req.query.pin,
        phone: req.query.phone,
        email: req.query.email
    });
});

server.post('/students/registration', (req, res) => {
    const select = `SELECT * FROM students WHERE student_PIN=?;
                    SELECT * FROM students WHERE student_phonenumber=?;
                    SELECT * FROM students WHERE student_email=?`;
    connection.query(select, [req.body.pin, req.body.phone, req.body.email], (error, result) => {
        if (error) {
            const string: string = encodeURIComponent('Unable to connect to the database, please try again later');
            res.redirect(`/students/signup?queryy=${string}`); 
        } else {
            if (result[0].length === 0 && result[1].length === 0 && result[2].length === 0) {
                const token = jwt.sign({ user: req.body }, process.env.SECRET_KEY_SIGNED_UP, { expiresIn: '10m' });
                email.sendConfirmMessage(req.body.email, req.body.name);
            }
            else {
                let pin: string = '', phone: string = '', email: string = '', query: string = '';
                if (result[0].length > 0) {
                    query = encodeURIComponent(' ');
                    pin = encodeURIComponent('This personal identity number already exists in the database\n');
                }
                if (result[1].length > 0) {
                    query = encodeURIComponent(' ');
                    phone = encodeURIComponent('This phone number already exists in the database\n');
                } 
                if (result[2].length > 0) {
                    query = encodeURIComponent(' ');
                    email = encodeURIComponent('This email already exists in the database');
                } 
                res.redirect(`/students/signup?queryy=${query}&pin=${pin}&phone=${phone}&email=${email}`);
            }
        }
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});