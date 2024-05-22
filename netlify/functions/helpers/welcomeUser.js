const getAppSettings = require('./getAppSettings');
// const getPasswordResetLink = require('./getPasswordResetLink');
const sendEmail = require('./sendEmail');
const userWelcomeEmailBody = require('../emailBodies/userWelcomeEmailBody');

const welcomeUser = (db, id, email, displayName) => {

    return new Promise(async (resolve, reject) => {

        try {

            console.log(`Generating email with password set link to send to ${email}`);
            const subject = `Welcome to Demurodas!`;

            const appSettings = await getAppSettings(db);
            const domain = appSettings.domain;

            // const passwordResetLink = await getPasswordResetLink(admin, email, domain);
            const body = await userWelcomeEmailBody(displayName);

            await sendEmail(email, subject, body);

            await db.collection('users').doc(id).update({ welcomeSent: true });

            console.log(`Wrote update to user's doc in Firestore: "welcomeSent = true"`);

            resolve();

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = welcomeUser;