const verifyToken = require('../helpers/verifyToken');
const updateUserProfile = require('../helpers/updateUserProfile');
const updateUserDoc = require('../helpers/updateUserDoc');

const updateProfile = (db, admin) => async (req, res) => {

    try {

        console.log(`Saving profile update...`);

        const body = JSON.parse(req.body);
        const token = body.token;
        const id = await verifyToken(admin, token);


        let proms = [
            updateUserProfile(admin, id, body),
            updateUserDoc(db, id, body)
        ];

        await Promise.all(proms);

        console.log(`Successfully updated user profile in Firebase and updated their corresponding user doc in Firestore - terminating with a 200`);
        res.sendStatus(200);


    } catch (err) {

        console.error(err);
        res.sendStatus(500);

    }

}

module.exports = updateProfile;