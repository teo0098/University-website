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
    if ((<any>req).session.logged) {
        res.status(401).redirect('/students/panel');
    } else {
        res.status(200).render('students');
    }
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

server.post('/students/registration', (req, res) => {
    const select = `SELECT * FROM students WHERE student_PIN=?;
                    SELECT * FROM students WHERE student_phonenumber=?;
                    SELECT * FROM students WHERE student_email=?`;
    pool.query(select, [req.body.pin, req.body.phone, req.body.email], async (error, result) => {
        if (error) {
            const string: string = encodeURIComponent('Unable to connect to the database, please try again later.');
            res.status(404).redirect(`/students/signup?queryy=${string}`); 
        } else {
            if (result[0].length === 0 && result[1].length === 0 && result[2].length === 0) {
                try {
                    const hash = await bcrypt.hash(req.body.password, 10);
                    req.body.password = hash;
                    const user = req.body;
                    const data = {
                        student_id: null, student_name: user.name.toLowerCase(), student_lastname: user.lastname.toLowerCase(),
                        student_sex: user.sex, student_PIN: user.pin, student_birthdate: user.birthdate, 
                        student_phonenumber: user.phone, student_email: user.email, student_zipcode: user.zipcode,
                        student_location: user.location.toLowerCase(), student_apartmentnumber: user.apartment, 
                        student_street: user.street.toLowerCase(), student_password: user.password
                    };
                    const insert = `INSERT INTO students SET ?`;
                    pool.query(insert, data, (err) => {
                        if (err) {
                            res.status(500).redirect(`/students/signup?queryy=
                            ${encodeURIComponent('We weren\'t able to create your account. Please try again later.')}`);
                        } else {
                            mail.sendWelcomeMessage(user.email, user.name);
                            mail.sendDecisionMessage(user.name, user.lastname, user.pin, process.env.DECISION_KEY, user.email, user.major);
                            res.status(201).redirect(`/students/signup?success=${
                            encodeURIComponent(`We sent you an welcome email to your mailbox. Check it out. 
                            It is possible that our email got into spam folder.`)}`);
                        }
                    });
                } catch(e) {
                    res.status(404).redirect(`/students/signup?queryy=
                    ${encodeURIComponent('We weren\'t able to encrypt your password. Please try again later.')}`);
                }
            }
            else {
                let pin: string = '', phone: string = '', email: string = '', query: string = '';
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
                res.status(403).redirect(`/students/signup?queryy=${query}&pin=${pin}&phone=${phone}&email=${email}`);
            }
        }
    });
});

server.get('/students/acception', (req, res) => {
    if (req.query.decision === process.env.DECISION_KEY) {
        const update = `UPDATE students SET student_accepted='YES' WHERE student_PIN=?`;
        pool.query(update, [`${req.query.pin}`], (err1) => {
            if (err1) {
                res.status(404).send({ error: 'Not updated' });
            } else {
                const selectID = `SELECT * FROM students WHERE student_PIN=?;
                          SELECT * FROM majors WHERE major_name=?`;
                pool.query(selectID, [req.query.pin, req.query.major], (err2, result) => {
                    if (err2) {
                        res.status(404).send({ error: 'No id selected' });
                    } else {
                        const insert = `INSERT INTO students_majors VALUES(NULL, ${result[1][0].major_id}, ${result[0][0].student_id}, 1)`;
                        pool.query(insert, (err3) => {
                            if (err3) {
                                res.status(404).send({ error: 'Not inserted' });
                            } else {
                                mail.sendAcceptionMessage(req.query.email, req.query.name);
                                res.status(201).send({ success: 'Accepted' });
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.status(401).redirect('/students/signup');
    }
});

server.get('/students/rejection', (req, res) => {
    if (req.query.decision === process.env.DECISION_KEY) {
        const deletee = `DELETE FROM students WHERE student_PIN=?`;
        pool.query(deletee, [`${req.query.pin}`], (err) => {
            if (err) {
                res.status(404).send({ error: 'Not deleted' });
            } else {
                mail.sendRejectionMessage(req.query.email, req.query.name);
                res.status(201).send({ success: 'Deleted' });
            }
        });
    } else {
        res.status(401).redirect('/students/signup');
    }
});

server.get('/students/signin', (req, res) => {
    if ((<any>req).session.logged) {
        res.status(401).redirect('/students/panel');
    } else {
        res.status(200).render('signin', {
            error: req.query.error,
            errorMessage
        });
    }
});

server.post('/students/login', (req, res) => {
    const select = "SELECT * FROM students WHERE student_email=? AND student_accepted='YES'";
    pool.query(select, [req.body.email], async (err, result) => {
        try {
            if (err) {
                throw 'Unable to connect to the database, please try again later.';
            } else {
                if (result.length === 0) {
                    throw 'Email or password is incorrect';
                } else {
                    const match = await bcrypt.compare(req.body.password, result[0].student_password);
                    if (!match) {
                        throw 'Email or password is incorrect';
                    } else {
                        const date = new Date(result[0].student_birthdate);
                        const dateOfBirth = date.toLocaleDateString();
                        const sex = result[0].student_sex === 'M' ? 'Man' : 'Woman';
                        const student = [ 
                            {key: 'Name', value: result[0].student_name},
                            {key: 'Last name', value: result[0].student_lastname}, 
                            {key: 'Sex', value: sex},
                            {key: 'Personal identity number', value: result[0].student_PIN}, 
                            {key: 'Date of birth', value: dateOfBirth}, 
                            {key: 'Phone number', value: result[0].student_phonenumber},
                            {key: 'Email', value: result[0].student_email}, 
                            {key: 'Postal code', value: result[0].student_zipcode}, 
                            {key: 'Living place', value: result[0].student_location},
                            {key: 'Apartment/home number', value: result[0].student_apartmentnumber}, 
                            {key: 'Street', value: result[0].student_street}
                        ];
                        (<any>req).session.logged = student;
                        res.status(200).redirect('/students/panel');
                    }
                }
            }
        } catch (error) {
            res.status(404).redirect(`/students/signin?error=${encodeURIComponent(error)}`);
        }
    });
});

server.get('/students/panel', (req, res) => {
    if ((<any>req).session.logged) {
        res.status(200).render('panel', {
            student_data: (<any>req).session.logged
        });
    } else {
        res.status(401).redirect('/students/signin');
    }
});

server.get('/students/grades', (req, res) => {
    if ((<any>req).session.logged) {
        const queryMajors = `SELECT majors.major_name, students_majors.semnumber FROM majors
                             JOIN students_majors ON majors.major_id = students_majors.major_id
                             JOIN students ON students.student_id = students_majors.student_id
                             WHERE students.student_email = "${(<any>req).session.logged[6].value}";`;
        let error: string | null = null;
        pool.query(queryMajors, (err, result) => {
            if (err) {
                error = 'There has been problem with database occured, please try again later.';
            }
            if (req.query.data) {
                res.send({data: req.query.data})
            } else {
                res.status(200).render('grades', {
                    student_data: (<any>req).session.logged,
                    error,
                    majors_data: result,
                    info_error: req.query.error,
                    info_data: req.query.data
                });
            }
        });
    } else {
        res.status(401).redirect('/students/signin');
    }
});

server.get('/students/info', (req, res) => {
    if ((<any>req).session.logged) {
        const select = `SELECT s_m.semnumber FROM majors m
                        JOIN students_majors s_m ON m.major_id = s_m.major_id
                        JOIN students s ON s.student_id = s_m.student_id
                        WHERE m.major_name = ? AND s.student_email = "${(<any>req).session.logged[6].value}"`;
        pool.query(select, [`${req.query.major}`], (err, result) => {
            if (err) {
                res.status(404).redirect(`/students/grades?error=${encodeURIComponent('There has been problem with database occured, please try again later.')}`);
            } else {
                if (result[0].semnumber < req.query.semester) {
                    res.status(404).redirect(`/students/grades?error=${encodeURIComponent('You have not reached that semester yet.')}`);
                } else {
                    const select2 = `SELECT m.major_name, m_s.semnumber, s.subject_name, s.subject_type,
                                     t.teacher_name, t.teacher_lastname, t.teacher_degree
                                     FROM majors m, majors_subjects m_s, subjects s, teachers t, teachers_subjects t_s
                                     WHERE m_s.major_id = m.major_id AND s.subject_id = m_s.subject_id 
                                     AND t.teacher_id = t_s.teacher_id AND s.subject_id = t_s.subject_id 
                                     AND m.major_name = ? AND m_s.semnumber = ?`;
                    pool.query(select2, [`${req.query.major}`, req.query.semester], (err2, result2) => {
                        if (err2) {
                            res.status(404).redirect(`/students/grades?error=${encodeURIComponent('There has been problem with database occured, please try again later.')}`);
                        } else {
                            res.status(200).redirect(`/students/grades?data=${encodeURIComponent(JSON.stringify(result2[0]))}
                            &data=${encodeURIComponent(JSON.stringify(result2[1]))}&data=${encodeURIComponent(JSON.stringify(result2[2]))}
                            &data=${encodeURIComponent(JSON.stringify(result2[3]))}&data=${encodeURIComponent(JSON.stringify(result2[4]))}
                            &data=${encodeURIComponent(JSON.stringify(result2[5]))}&data=${encodeURIComponent(JSON.stringify(result2[6]))}
                            &data=${encodeURIComponent(JSON.stringify(result2[7]))}&data=${encodeURIComponent(JSON.stringify(result2[8]))}`);
                        }
                    });
                }
            }
        });
    } else {
        res.status(401).redirect('/students/signin');
    }
});

/*
SELECT m.major_name, m_s.semnumber, s.subject_name, s.subject_type, t.teacher_name, t.teacher_lastname, t.teacher_degree
FROM majors m, majors_subjects m_s, subjects s, teachers t, teachers_subjects t_s
WHERE m_s.major_id = m.major_id AND s.subject_id = m_s.subject_id AND t.teacher_id = t_s.teacher_id AND s.subject_id = t_s.subject_id 
AND m.major_name = "Dietetics" AND m_s.semnumber = 2
*/

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});