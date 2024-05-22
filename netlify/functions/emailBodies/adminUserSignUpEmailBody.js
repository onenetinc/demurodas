const adminUserSignUpEmailBody = (adminDisplayName, userDoc) => {

    const resale = userDoc.resale ? userDoc.resale : 'Not supplied';
    const website = userDoc.website ? userDoc.website : 'Not supplied';

    const body =
        `
Dear ${adminDisplayName},

The following person has requested to become a registered customer. Please review their information and follow the instructions below.

Name: ${userDoc.displayName}
Email: ${userDoc.email}
Company: ${userDoc.company}
Americas: ${userDoc.americas}
Resale ID: ${resale}
Website: ${website}

Instructions:

1. Go to https://console.firebase.google.com/u/0/project/demurodas/authentication/users.

2. To approve this customer, click the 3 dots on the user and click "Enable user". This will trigger a welcome email with a "set password" link to the customer. 

3. To disapprove this customer, click the 3 dots on the user and click "Delete user". This will trigger an explainer email to the user.
`

    return body;

}

module.exports = adminUserSignUpEmailBody;