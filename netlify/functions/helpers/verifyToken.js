const verifyToken = (admin, token) => {

    return new Promise(async (resolve) => {

        try {

            console.log(`Verifying user token...`);

            const decodedToken = await admin.auth().verifyIdToken(token);
            const id = decodedToken.uid;

            console.log(`Verified user token belonging to user with uid ${id}`);

            resolve(id);

        } catch (err) {

            console.error(err);
            resolve(false);

        }

    });

}

module.exports = verifyToken;