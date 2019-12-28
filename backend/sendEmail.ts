import mail from '@sendgrid/mail';

mail.setApiKey(process.env.SENDGRID_API_KEY);

type MSG = {to: string, from: string, subject: string, html: string};

const sendConfirmMessage: (email: string, name: string) => void = (email: string, name: string) => {
    const message: MSG = {
        to: email,
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Confirm your registration',
        html: `<h1>Welcome ${name}</h1>
                <h3>Please confirm your registration process by clicking the link down below</h3>
                <a href="https://teo-university-app.herokuapp.com/students/confirmation">Confirm</a>`
    };
    mail.send(message);
};

const sendDecisionMessage: (name: string, lastname: string, pin: string) => void = (name: string, lastname: string, pin: string) => {
    const message: MSG = {
        to: 'teodor.tkaczyk98@gmail.com',
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Application decision',
        html: `<h1>What to do with this user?</h1>
                <h3>Name: ${name}</h3>
                <h3>Last name: ${lastname}</h3>
                <h3>Personal ID: ${pin}</h3>
                <a href="https://teo-university-app.herokuapp.com/students/acception">Accept student</a>
                <a href="https://teo-university-app.herokuapp.com/students/rejection">Reject student</a>`
    };
    mail.send(message);
}

export default {
    sendConfirmMessage,
    sendDecisionMessage
};