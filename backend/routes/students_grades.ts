import express from 'express';
import pool from '../dbconnection';
const router = express.Router();

router.get('/students/grades', (req, res) => {
    if ((<any>req).session.logged) {
        const queryMajors = `SELECT majors.major_name, students_majors.semnumber FROM majors
                             JOIN students_majors ON majors.major_id = students_majors.major_id
                             JOIN students ON students.student_id = students_majors.student_id
                             WHERE students.student_email = "${(<any>req).session.logged[6].value}";`;
        let error: string | null = null;
        pool.query(queryMajors, (err, result) => {
            if (err) {
                error = 'There has been problem with the database occured, please try again later.';
            }
            const splitArray: Array<Array<string>> = [];
            if (req.query.data) {
                let holdArray: Array<string> = [];
                for (let i = 0; i < req.query.data.length; i++) {
                    if (i % 8 === 0 && i > 0) {
                        splitArray.push(holdArray);
                        holdArray = [];
                    }
                    holdArray.push(req.query.data[i]);
                }
                splitArray.push(holdArray);
            }
            res.status(200).render('grades', {
                student_data: (<any>req).session.logged,
                error,
                majors_data: result,
                info_error: req.query.error,
                info_data: splitArray
            });
        });
    } else {
        res.status(401).redirect('/students/signin');
    }
});

router.get('/students/info', (req, res) => {
    if ((<any>req).session.logged) {
        const select = `SELECT s_m.semnumber FROM majors m
                        JOIN students_majors s_m ON m.major_id = s_m.major_id
                        JOIN students s ON s.student_id = s_m.student_id
                        WHERE m.major_name = ? AND s.student_email = "${(<any>req).session.logged[6].value}"`;
        pool.query(select, [`${req.query.major}`], (err, result) => {
            if (err) {
                res.status(404).redirect(`/students/grades?error=${encodeURIComponent('There has been problem with the database occured, please try again later.')}`);
            } else {
                if (result[0].semnumber < req.query.semester) {
                    res.status(404).redirect(`/students/grades?error=${encodeURIComponent('You have not reached that semester yet.')}`);
                } else {
                    const select2 = `SELECT m.major_name, m_s.semnumber, s.subject_name, s.subject_type,
                                     t.teacher_name, t.teacher_lastname, t.teacher_degree
                                     FROM majors m, majors_subjects m_s, subjects s, teachers t, teachers_subjects t_s
                                     WHERE m_s.major_id = m.major_id AND s.subject_id = m_s.subject_id
                                     AND t.teacher_id = t_s.teacher_id AND s.subject_id = t_s.subject_id
                                     AND m.major_name = ? AND m_s.semnumber = ?;
                                     SELECT s_s.grade, su.subject_name FROM students_subjects s_s
                                     JOIN students s ON s.student_id = s_s.student_id
                                     JOIN subjects su ON su.subject_id = s_s.subject_id
                                     WHERE s_s.semnumber = ? AND s.student_email=?`;
                    pool.query(select2, [`${req.query.major}`, req.query.semester, req.query.semester, `${(<any>req).session.logged[6].value}`],
                        (err2, result2) => {
                            if (err2) {
                                res.status(404).redirect(`/students/grades?error=${encodeURIComponent('There has been problem with the database occured, please try again later.')}`);
                            } else {
                                let data: string = '';
                                if (result2[1].length > 0) {
                                    for (let i: number = 0; i < result2[0].length; i++) {
                                        const subject = result2[1].find(subject => subject.subject_name === result2[0][i].subject_name);
                                        let grade: string | number;
                                        if (typeof subject === "undefined") {
                                            grade = "Not assigned";
                                        } else {
                                            grade = subject.grade;
                                        }
                                        result2[0][i] = {
                                            ...result2[0][i],
                                            grade
                                        };
                                    }
                                } 
                                else {
                                    for (let i = 0; i < result2[0].length; i++) {
                                       result2[0][i] = {
                                        ...result2[0][i],
                                        grade: "Not assigned"
                                       };
                                    }
                                }
                                for (const obj of result2[0]) {
                                    for (let key in obj) {
                                        data += `data=${encodeURIComponent(obj[key])}&`;
                                    }
                                }
                                res.status(200).redirect(`/students/grades?${data}`);
                            }
                    });
                }
            }
        });
    } else {
        res.status(401).redirect('/students/signin');
    }
});

export default router;