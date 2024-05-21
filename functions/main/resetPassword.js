const getAppSettings = require('../helpers/getAppSettings');
const getPasswordResetLink = require('../helpers/getPasswordResetLink');
const userPasswordResetEmailBody = require('../emailBodies/userPasswordResetEmailBody');
const sendEmail = require('../helpers/sendEmail');

const resetPassword = (db, admin) => async (req, res) => {

    try {

        const body = JSON.parse(req.body);
        const email = body.email;

        console.log(`Sending a password reset email to user ${email}`);

        let user;

        try {

            user = await admin.auth().getUserByEmail(email);

        } catch (err) {

            console.log(`No record was found of a user with this email address - terminating with a 200 for security reasons`);
            return res.sendStatus(200);

        }

        const displayName = user.displayName;

        const appSettings = await getAppSettings(db);
        const domain = appSettings.domain;

        console.log(`Generating email with password reset link to send to ${email}`);
        const subject = `Password reset request`;
        const passwordResetLink = await getPasswordResetLink(admin, email, domain);
        const emailBody = await userPasswordResetEmailBody(displayName, passwordResetLink);

        await sendEmail(email, subject, emailBody);

        console.log(`Successfully send password reset email to ${email} - terminating with a 200`);

        return res.sendStatus(200);

    } catch (err) {

        console.error(err);
        return res.sendStatus(500);

    }

}

module.exports = resetPassword;