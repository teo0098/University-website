import mail from '@sendgrid/mail';

mail.setApiKey(process.env.SENDGRID_API_KEY);

const sendConfirmMessage: (email: string, name: string) => void = (email: string, name: string) => {
    const message = {
        to: email,
        from: 'teodor.tkaczyk98@gmail.com',
        subject: 'Confirm your registration',
        html: `<h1>Welcome ${name}</h1>
                <h3>Please confirm your registration process by clicking the link down below</h3>
                <a href="https://teo-university-app.herokuapp.com/students/confirmation?name=${name}">Confirm</a>`
    };
    mail.send(message);
};

export default {
    sendConfirmMessage
}