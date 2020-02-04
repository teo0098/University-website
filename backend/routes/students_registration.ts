import express from 'express';
import pool from '../dbconnection';
import bcrypt from 'bcryptjs';
import mail from '../sendEmail';
const router = express.Router();

router.post('/students/registration', (req, res) => {
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

export default router;