const userSignUpDisapprovedEmailBody = (displayName) => {

    const body =
        `
Dear ${displayName},

We regret to inform you that your request to become a registered trade member for DeMuro Das has not been approved.

Thank you for your interest,

The DeMuro Das team
`

    return body;

}

module.exports = userSignUpDisapprovedEmailBody;