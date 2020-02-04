import express from 'express';
import pool from '../dbconnection';
import bcrypt from 'bcryptjs';
const router = express.Router();

router.post('/students/login', (req, res) => {
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

export default router;