import express from 'express';
import path from 'path';
import hbs from 'hbs';
import pool from './dbconnection';
import bodyParser from 'body-parser';
import mail from './sendEmail';
import session from 'express-session';
import cookie from 'cookie-parser';
import bcrypt from 'bcryptjs';

const server: express.Application = express();
const port = process.env.PORT;

let errorMessage: string | null = null;
let majors: Array<string> = [];
pool.getConnection((error, connection) => {
    if (error) errorMessage = 'Unable to connect to the database, please try again later';
    else {
        connection.query('SELECT major_name FROM majors', (error, result) => {
            if (error) errorMessage = 'Sorry for any issues, we couldn\'t load our university majors for you, please try again later';
            else {
                result.forEach((value) => {
                    majors.push(value.major_name);
                });
            }
            connection.release();
        });
    }
});

server.use(session( { secret: process.env.SECRET_SESSION_KEY, maxAge: 86400000 * 7 } ));
server.use(cookie());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.set('views', path.join(__dirname, '../frontend/templates/views'));
server.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, '../frontend/templates/partials'));
server.use(express.static(path.join(__dirname, '../frontend/public')));

server.get('', (req, res) => {
    res.status(200).render('index', {
        errorMessage,
        majors
    });
});

server.get('/students', (req, res) => {
    res.status(200).render('students');
});

server.get('/students/signup', (req, res) => {
    res.status(200).render('signup', {
        year: new Date().getFullYear() - 20,
        maxYear: new Date().getFullYear() - 18,
        minYear: new Date().getFullYear() - 70,
        errorMessage,
        majors,
        query: req.query.queryy,
        pin: req.query.pin,
        phone: req.query.phone,
        email: req.query.email,
        success: req.query.success || ''
    });
});

server.post('/students/registration', (req, res) => {
    const select = `SELECT * FROM students WHERE student_PIN=?;
                    SELECT * FROM students WHERE student_phonenumber=?;
                    SELECT * FROM students WHERE student_email=?`;
    pool.query(select, [req.body.pin, req.body.phone, req.body.email], async (error, result) => {
        if (error) {
            const string: string = encodeURIComponent('Unable to connect to the database, please try again later');
            res.status(404).redirect(`/students/signup?queryy=${string}`); 
        } else {
            if (result[0].length === 0 && result[1].length === 0 && result[2].length === 0) {
                try {
                    const hash = await bcrypt.hash(req.body.password, 10);
                    req.body.password = hash;
                    req.body.name = req.body.name.toLowerCase();
                    req.body.lastname = req.body.lastname.toLowerCase();
                    req.body.location = req.body.location.toLowerCase();
                    req.body.street = req.body.street.toLowerCase();
                    res.cookie('name', req.body.name, { maxAge: 86400000 });
                    (<any>req).session.register = req.body;
                    mail.sendConfirmMessage(req.body.email, req.body.name);
                    res.status(201).redirect(`/students/signup?success=${
                        encodeURIComponent('We sent you an confirming email to your mailbox. Please confirm your email in 24 hours. It is possible that our email got into spam folder')}`);
                } catch(e) {
                    res.status(404).redirect(`/students/signup?queryy=
                    ${encodeURIComponent('We weren\'t able to encrypt your password. Please try again later.')}`);
                }
            }
            else {
                let pin: string = '', phone: string = '', email: string = '', query: string = '';
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
                res.status(403).redirect(`/students/signup?queryy=${query}&pin=${pin}&phone=${phone}&email=${email}`);
            }
        }
    });
});

server.get('/students/confirmation', (req, res) => {
    if (req.cookies.name) {
        res.status(200).render('confirmation', {
            name: req.cookies.name
        });
        (<any>req).session.confirm = (<any>req).session.register;
        delete (<any>req).session.register;
        const user =  (<any>req).session.confirm;
        mail.sendDecisionMessage(user.name, user.lastname, user.pin);
    } else {
        res.status(401).redirect('/students/signup');
    }    
});

server.get('/students/acception', (req, res) => {
    if ((<any>req).session.confirm && req.query.key === process.env.DECISION_KEY) {
        const user = (<any>req).session.confirm;
        const data = {
            student_id: null, student_name: user.name, student_lastname: user.lastname, student_sex: user.sex, student_PIN: user.pin,
            student_birthdate: user.birthdate, student_phonenumber: user.phone, student_email: user.email, student_zipcode: user.zipcode,
            student_location: user.location, student_apartmentnumber: user.apartment, student_street: user.street, student_password: user.password
        };
        const insert = `INSERT INTO students SET ?`;
        pool.query(insert, data, (err, result) => {
            if (err) {
                res.send({ error: 'Sth went wrong' });
            }
        });
        mail.sendAcceptionMessage((<any>req).session.confirm.email, (<any>req).session.confirm.name);
        res.status(201).redirect('');
    } else {
        res.status(401).redirect('/students/signup');
    }
});

server.get('/students/rejection', (req, res) => {
    if ((<any>req).session.confirm && req.query.key === process.env.DECISION_KEY) {
        mail.sendRejectionMessage((<any>req).session.confirm.email, (<any>req).session.confirm.name);
        res.status(201).redirect('');
    } else {
        res.status(401).redirect('/students/signup');
    }
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});