const getPasswordResetLink = (admin, email, domain) => {

    return new Promise(async (resolve, reject) => {

        try {

            console.log(`Generating password reset link`);

            const url = `http://${domain}/u/action`;

            const passwordResetLink = await admin.auth().generatePasswordResetLink(email, {

                url: url,
                handleCodeInApp: false

            });

            resolve(passwordResetLink);

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = getPasswordResetLink;