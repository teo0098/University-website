import express from 'express';
import mail from '../sendEmail';
const router = express.Router();

router.get('/contact', (req, res) => {
    let email: string = "";
    if ((<any>req).session.logged) {
        email = (<any>req).session.logged[6].value;
    }
    res.status(200).render('contact', {
        email,
        success: req.query.success
    });
})

router.post('/contact/message', (req, res) => {
    mail.sendContactMessage(req.body.email, req.body.message.trim());
    res.status(200).redirect(`/contact?success=${encodeURIComponent("Message has been sent successfully")}`);
});

export default router;