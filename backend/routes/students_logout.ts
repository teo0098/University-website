import express from 'express';
const router = express.Router();

router.get('/students/logout', (req, res) => {
    if ((<any>req).session.logged) {
        (<any>req).session.destroy();
        res.status(200).redirect('/students/signin');
    } else {
        res.status(401).redirect('/students/signin');
    }
});

export default router;