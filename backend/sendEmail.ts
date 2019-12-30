import mail from '@sendgrid/mail';

mail.setApiKey(process.env.SENDGRID_API_KEY);

type MSG = {to: string, from: string, subject: string, html: string};

const sendWelcomeMessage = (email: string, name: string) => {
    const message: MSG = {
        to: email,
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Welcome new student',
        html: `<h1>Welcome ${name}</h1>
                <h3>We are thankful for confirming your registration.
                We will let you know about your application soon by sending an email to your mailbox. Stay tuned.</h3>`
    };
    mail.send(message);
};

const sendDecisionMessage = (name: string, lastname: string, pin: string, decision: string, email: string) => {
    const message: MSG = {
        to: 'teodor.tkaczyk98@gmail.com',
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Application decision',
        html: `<h1>What to do with this user?</h1>
                <h3>Name: ${name}</h3>
                <h3>Last name: ${lastname}</h3>
                <h3>Personal ID: ${pin}</h3>
                <a href="https://teo-university-app.herokuapp.com/students/acception?decision=${decision}
                &email=${email}&name=${name}">Accept student</a>
                <a href="https://teo-university-app.herokuapp.com/students/rejection?decision=${decision}
                &email=${email}&name=${name}&pin=${pin}">Reject student</a>`
    };
    mail.send(message);
}

const sendAcceptionMessage = (email: string, name: string) => {
    const message: MSG = {
        to: email,
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Decision',
        html: `<h1>Welcome ${name}</h1>
                <h3>We want to inform you that you passed our requirements and we are looking forward to see you at our academy.</h3>`
    };
    mail.send(message);
};

const sendRejectionMessage = (email: string, name: string) => {
    const message: MSG = {
        to: email,
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Decision',
        html: `<h1>Welcome ${name}</h1>
                <h3>We want to inform you that you didn't pass our requirements. We hope you won't give up and try another time. Stay positive.</h3>`
    };
    mail.send(message);
};

export default {
    sendWelcomeMessage,
    sendDecisionMessage,
    sendAcceptionMessage,
    sendRejectionMessage
};