const Mailgen = require('mailgen');
const sgMail = require('@sendgrid/mail');


const sendEmail = (name, email, resetLink)=>{
    
    // Mailgen part starts here

    // Configure mailgen by setting a theme and your product info
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            // Appears in header & footer of e-mails
            name: 'Social Dude',
            link: 'https://socialdude.herokuapp.com/'
        }
    });
    

    // Generating content(data)
    const emailContent = {
        body: {
            name: name,
            intro: 'You have received this email because a password reset request for your account was received.',
            action: {
                instructions: 'Click the button below to reset your password:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Reset your Password',
                    link: resetLink
                }
            },
            outro: 'If you did not request a password reset, no further action is required on your part.'
        }
    };
    

    // Generating an HTML email Template with the provided contents
    const emailTemplate = mailGenerator.generate(emailContent);



    // Mailgen part done here



    // Sendgrid part starts here
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Hello from SocialDude',
        html: emailTemplate,
    };

    // sending the mail
    sgMail.send(msg)
    .then((response)=> console.log('Email sent...'))
    .catch((error)=> {
        console.log(error.message)
        throw new Error(error);
    })

    // Sendgrid part done here
    
}

module.exports = sendEmail;