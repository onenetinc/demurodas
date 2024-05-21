const getAppSettings = require('../helpers/getAppSettings');
const getEnabledUsers = require('../helpers/getEnabledUsers');
const getUserDoc = require('../helpers/getUserDoc');


const gaUsers = (db, admin) => async (req, res) => {
    try {
        const secret = req.query.secret;
        if (!secret) throw 400

        const appSettings = await getAppSettings(db);
        const allowedSecrets = appSettings.allowed;
        if (!allowedSecrets.includes(secret)) throw 401

        const users = await getEnabledUsers(admin);
        let resp = {};
        const getUserData = Object.entries(users).map(async user => {
            try {
                const userDoc = await getUserDoc(db, user[0]);
                return resp[user[0]] = `${user[1].displayName} | ${userDoc.company} | ${user[0]}`;
            }
            catch (err) {
                return console.error(err);
            }
        });
        await Promise.all(getUserData);
        console.log(resp);
        return res.json(resp);

    } catch (err) {
        console.log(`Responding with error code ${err}`)
        res.sendStatus(err);
    }
}

module.exports = gaUsers;
