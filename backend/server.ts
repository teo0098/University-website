import express from 'express';
import path from 'path';
import hbs from 'hbs';
import pool from './dbconnection';
import bodyParser from 'body-parser';
import session from 'express-session';

import students_route from './routes/students';
import students_registration_route from './routes/students_registration';
import students_decision_route from './routes/students_decision';
import students_login_route from './routes/students_login';
import students_panel_route from './routes/students_panel';
import students_grades_route from './routes/students_grades';
import students_settings_route from './routes/students_settings';
import students_logout_route from './routes/students_logout';

const server: express.Application = express();
const port = process.env.PORT;

let errorMessage: string | null = null;
let majors: Array<string> = [];
pool.getConnection((error, connection) => {
    if (error) errorMessage = 'Unable to connect to the database, please try again later.';
    else {
        connection.query('SELECT major_name FROM majors', (error, result) => {
            if (error) errorMessage = 'Sorry for any issues, we couldn\'t load our university majors for you, please try again later.';
            else {
                result.forEach((value) => {
                    majors.push(value.major_name);
                });
            }
            connection.release();
        });
    }
});

server.use(session( { secret: process.env.SECRET_SESSION_KEY, resave: false, saveUninitialized: false , maxAge:  86400000 * 7 } )); //Date.now() +
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.set('views', path.join(__dirname, '../frontend/templates/views'));
server.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, '../frontend/templates/partials'));
server.use(express.static(path.join(__dirname, '../frontend/public')));

server.use(students_route);
server.use(students_registration_route);
server.use(students_decision_route);
server.use(students_login_route);
server.use(students_panel_route);
server.use(students_grades_route);
server.use(students_settings_route);
server.use(students_logout_route);

server.get('', (req, res) => {
    res.status(200).render('index', {
        errorMessage,
        majors
    });
});

server.get('/students/signup', (req, res) => {
    if ((<any>req).session.logged) {
        res.status(401).redirect('/students/panel');
    } else {
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
    }
});

server.get('/students/signin', (req, res) => {
    if ((<any>req).session.logged) {
        res.status(401).redirect('/students/panel');
    } else {
        res.status(200).render('signin', {
            error: req.query.error,
            errorMessage,
            success: req.query.success
        });
    }
});

server.get('*', (req, res) => {
    res.status(404).redirect('/');
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});