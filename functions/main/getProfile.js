const verifyToken = require('../helpers/verifyToken');
const getUserDoc = require('../helpers/getUserDoc');

const getProfile = (db, admin) => async (req, res) => {

    try {

        const id = req.query.id;
        const token = req.query.token;
        const isAuthed = await verifyToken(admin, token);

        if (!id) {

            console.log(`No item sku was provided - terminating with a 400`);
            return res.sendStatus(401);

        } else if (!isAuthed) {

            console.log(`The token was not valid - terminating with a 401`);
            return res.sendStatus(401);

        } else {

            const userDoc = await getUserDoc(db, id);

            if ('history' in userDoc) {
                delete userDoc.history;
            }

            console.log(`Found user doc with id ${id} - terminating with a 200`);
            return res.json(JSON.stringify(userDoc));

        }

    } catch (err) {

        console.error(err);
        console.log(`Could not find a user doc with id ${req.query.id} - terminating with a 404`);
        return res.sendStatus(404);

    }

}

module.exports = getProfile;