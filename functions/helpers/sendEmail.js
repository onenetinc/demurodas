const nodemailer = require('nodemailer');
const functions = require('firebase-functions');

const accountEmail = functions.config().mail.username
const password = functions.config().mail.password
const clientId = functions.config().oauth.clientid
const clientSecret = functions.config().oauth.clientsecret
const refreshToken = functions.config().oauth.refreshtoken

let sendAttempts = 0;

const sendEmail = (email, subject, body) => {

    return new Promise(async (resolve, reject) => {

        try {

            console.log(`Sending email to: ${email}`);
            console.log(`Email subject: ${subject}`);
            console.log(`Email body: ${body}`);

            const transporter = nodemailer.createTransport({

                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: accountEmail,
                    pass: password,
                    clientId: clientId,
                    clientSecret: clientSecret,
                    refreshToken: refreshToken
                }

            });

            const mailOptions = {

                from: 'no-reply@demurodas.com',
                to: email,
                subject: subject,
                text: body

            };

            const send = await transporter.sendMail(mailOptions);

            console.log(`Sent email successfully, server response:`);
            console.log(JSON.stringify(send, null, 4));

            resolve();

        } catch (err) {

            console.error(err);

            if (err.code === 'ECONNECTION' && sendAttempts < 30) {

                console.log(`A network error occured while sending this email, going to try again`);
                sendAttempts++;
                console.log(`Number of next attempt: ${sendAttempts}`);

                setTimeout(() => {
                    sendEmail(email, subject, body);
                }, 3000);

            } else {

                reject(err);

            }

        }

    });

}

module.exports = sendEmail;