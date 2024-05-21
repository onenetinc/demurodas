const createUser = (admin, email, password, displayName) => {

    return new Promise(async (resolve, reject) => {

        try {

            console.log(`Creating Firebase user account...`);

            const userData = {
                email: email,
                password: password,
                displayName: displayName,
                disabled: true
            };

            const userAccount = await admin.auth().createUser(userData);

            console.log(`Created Firebase user account with these details:`);
            console.log(JSON.stringify(userData, null, 4));

            resolve(userAccount);

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = createUser;