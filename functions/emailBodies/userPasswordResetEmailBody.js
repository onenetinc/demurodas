const userWelcomeEmailBody = (displayName, link) => {

    const body =
        `
Dear ${displayName},

To reset the password for your DeMuro Das trade member account, please click the following link:

${link}

If you did not request a new password, please disregard this email.

The DeMuro Das team
`

    return body;

}

module.exports = userWelcomeEmailBody;