import express from 'express';
const router = express.Router();

router.get('/students', (req, res) => {
    if ((<any>req).session.logged) {
        res.status(401).redirect('/students/panel');
    } else {
        res.status(200).render('students');
    }
});

export default router;