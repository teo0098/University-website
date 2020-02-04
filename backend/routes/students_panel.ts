import express from 'express';
const router = express.Router();

router.get('/students/panel', (req, res) => {
    if ((<any>req).session.logged) {
        res.status(200).render('panel', {
            student_data: (<any>req).session.logged
        });
    } else {
        res.status(401).redirect('/students/signin');
    }
});

export default router;