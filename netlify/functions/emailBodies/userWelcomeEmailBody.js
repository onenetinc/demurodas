const userWelcomeEmailBody = (displayName) => {

    const body =
        `
Dear ${displayName},

We are pleased to inform you that your request to become a registered trade member with DeMuro Das has been accepted.

To access the reseller portal, please click the link below and sign in using the details you provided at registration.
https://demurodas.com/u/sign-in

Best regards,

The DeMuro Das team
`

    return body;

}

module.exports = userWelcomeEmailBody;