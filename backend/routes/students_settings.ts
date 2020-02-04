import express from 'express';
import pool from '../dbconnection';
import bcrypt from 'bcryptjs';
const router = express.Router();

router.get('/students/settings', (req, res) => {
    if ((<any>req).session.logged) {
        res.status(200).render('settings', {
            student_data: (<any>req).session.logged,
            error: req.query.error,
            success: req.query.success
        });
    } else {
        res.status(401).redirect('/students/signin');
    }
});

router.post('/students/alteration', (req, res) => {
    if ((<any>req).session.logged) {
        const select = `SELECT student_password FROM students WHERE student_email = ?`;
        pool.query(select, [`${(<any>req).session.logged[6].value}`], async (err, result) => {
            try {
                if (err) {
                    throw 'There has been problem with the database occured, please try again later.';
                } else {
                    const match = await bcrypt.compare(req.body.password, result[0].student_password);
                    if (!match) {
                        throw 'You have entered incorrect current password';
                    } else {
                        const hash = await bcrypt.hash(req.body.newpassword, 10);
                        req.body.newpassword = hash;
                        const update = `UPDATE students SET student_password = ?
                                        WHERE student_email = "${(<any>req).session.logged[6].value}"`;
                        pool.query(update, [`${req.body.newpassword}`], (err2) => {
                            if (err2) {
                                throw 'There has been problem with the database occured, please try again later.';
                            } else {
                                res.status(201).redirect(`/students/settings?success=${encodeURIComponent('Password has been successfully updated')}`);
                            }
                        });
                    }
                }
            } catch (e) {
                if (typeof e === null || typeof e === "undefined") {
                    e = 'We weren\'t able to encrypt your password. Please try again later.';
                }
                res.status(404).redirect(`/students/settings?error=${encodeURIComponent(e)}`);
            }
        });
    } else {
        res.status(401).redirect('/students/signin');
    }
});

router.post('/students/removal', (req, res) => {
    if ((<any>req).session.logged) {
        const update = `UPDATE students SET student_accepted="NO" WHERE student_email="${req.body.deleted}"`;
        pool.query(update, (err) => {
            if (err) {
                res.status(404).redirect(`/students/settings?error=${encodeURIComponent("Unable to delete your account. Please try again later.")}`);
            } else {
                (<any>req).session.destroy();
                res.status(201).redirect(`/students/signin?success=${encodeURIComponent('Your account has been successfully deleted')}`);
            }
        });
    } else {
        res.status(401).redirect('/students/signin');
    }
});

export default router;