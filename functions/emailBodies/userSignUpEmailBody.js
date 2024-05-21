const userSignUpEmailBody = (displayName) => {

    const body =
        `
Dear ${displayName},

Thank you for applying to become a registered trade member with DeMuro Das. We are currently processing your application and will notify you within the next business day whether or not your request has been approved.

In the meantime, should you require immediate assistance with trade pricing or orders, please contact us at:

Americas Inquiries:
amy.lee@demurodas.com
Ph: 718-521-6768

All Non-Americas Inquiries:
info@demurodas.com
Ph: +91 124 4384071

Best regards,

The DeMuro Das team
`

    return body;

}

module.exports = userSignUpEmailBody;