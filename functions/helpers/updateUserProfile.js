const updateUserProfile = (admin, id, body) => {

    return new Promise(async(resolve, reject) => {

        try {

            const firstName = body.firstName;
            const lastName = body.lastName;
            const displayName = `${firstName.trim()} ${lastName.trim()}`;

            const update = {
                email: body.email,
                displayName: displayName
            };

            await admin.auth().updateUser(id, update);

            console.log(`Updated user profile in Firebase with these details:`);
            console.log(JSON.stringify(update, null, 4));

            resolve();

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = updateUserProfile;