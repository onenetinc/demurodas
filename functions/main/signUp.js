const createUser = require('../helpers/createUser');
const createUserDoc = require('../helpers/createUserDoc');


const signUp = (db, admin) => async (req, res) => {

    try {

        console.log(`Creating new user...`);

        const body = JSON.parse(req.body);
        const email = body.email;
        const password = body.password;
        const firstName = body.firstName;
        const lastName = body.lastName;
        const displayName = `${firstName.trim()} ${lastName.trim()}`;

        const userAccount = await createUser(admin, email, password, displayName);

        const id = userAccount.uid;
        await createUserDoc(db, id, body);

        console.log(`Successfully created new user, created their corresponding user doc in Firestore and sent sign up email - terminating with a 201`);
        res.sendStatus(201);


    } catch (err) {

        switch (err.code) {

            case 'auth/invalid-email':
                console.log(`The supplied email address was badly formatted - terminating with a 400`)
                res.sendStatus(400);
                break;

            case 'auth/email-already-exists':
                console.log(`The supplied email address is already taken - terminating with a 409`)
                res.sendStatus(409);
                break;

            default:
                console.log(err);
                res.sendStatus(500);

        }

    }

}

module.exports = signUp;