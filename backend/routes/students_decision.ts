import express from 'express';
import pool from '../dbconnection';
import mail from '../sendEmail';
const router = express.Router();

router.get('/students/acception', (req, res) => {
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

router.get('/students/rejection', (req, res) => {
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

export default router;