const admin = require('firebase-admin');
const getAppSettings = require('./helpers/getAppSettings');
const getPasswordResetLink = require('./helpers/getPasswordResetLink');
const userPasswordResetEmailBody = require('./emailBodies/userPasswordResetEmailBody');
const sendEmail = require('./helpers/sendEmail');

const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'demurodas.appspot.com'
});

const db = admin.firestore();

const resetPassword = async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    const email = body.email;

    console.log(`Sending a password reset email to user ${email}`);

    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
    } catch (err) {
      console.log(`No record was found of a user with this email address - terminating with a 200 for security reasons`);
      return res.status(200).send('Success');
    }

    const displayName = user.displayName;

    const appSettings = await getAppSettings(db);
    const domain = appSettings.domain;

    console.log(`Generating email with password reset link to send to ${email}`);
    const subject = `Password reset request`;
    const passwordResetLink = await getPasswordResetLink(admin, email, domain);
    const emailBody = await userPasswordResetEmailBody(displayName, passwordResetLink);

    await sendEmail(email, subject, emailBody);

    console.log(`Successfully sent password reset email to ${email} - terminating with a 200`);
    return res.status(200).send('Password reset email sent');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
};

exports.handler = async (event, context) => {
  const req = {
    query: event.queryStringParameters,
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
    path: event.path
  };

  const res = {
    status: (code) => ({
      json: (data) => ({
        statusCode: code,
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }),
      send: (message) => ({
        statusCode: code,
        body: message,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
    })
  };

  await resetPassword(req, res);
};





// const getAppSettings = require('../helpers/getAppSettings');
// const getPasswordResetLink = require('../helpers/getPasswordResetLink');
// const userPasswordResetEmailBody = require('../emailBodies/userPasswordResetEmailBody');
// const sendEmail = require('../helpers/sendEmail');

// const resetPassword = (db, admin) => async (req, res) => {

//     try {

//         const body = JSON.parse(req.body);
//         const email = body.email;

//         console.log(`Sending a password reset email to user ${email}`);

//         let user;

//         try {

//             user = await admin.auth().getUserByEmail(email);

//         } catch (err) {

//             console.log(`No record was found of a user with this email address - terminating with a 200 for security reasons`);
//             return res.sendStatus(200);

//         }

//         const displayName = user.displayName;

//         const appSettings = await getAppSettings(db);
//         const domain = appSettings.domain;

//         console.log(`Generating email with password reset link to send to ${email}`);
//         const subject = `Password reset request`;
//         const passwordResetLink = await getPasswordResetLink(admin, email, domain);
//         const emailBody = await userPasswordResetEmailBody(displayName, passwordResetLink);

//         await sendEmail(email, subject, emailBody);

//         console.log(`Successfully send password reset email to ${email} - terminating with a 200`);

//         return res.sendStatus(200);

//     } catch (err) {

//         console.error(err);
//         return res.sendStatus(500);

//     }

// }

// module.exports = resetPassword;