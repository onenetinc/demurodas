const { admin, db } = require('./helpers/firebase');
const createUser = require('./helpers/createUser');
const createUserDoc = require('./helpers/createUserDoc');

const signUp = async (req, res) => {
  try {
    console.log(`Creating new user...`);

    const body = JSON.parse(req.body);
    const { email, password, firstName, lastName } = body;
    const displayName = `${firstName.trim()} ${lastName.trim()}`;

    const userAccount = await createUser(admin, email, password, displayName);

    const id = userAccount.uid;
    await createUserDoc(db, id, body);

    console.log(`Successfully created new user, created their corresponding user doc in Firestore and sent sign up email - terminating with a 201`);
    return res.status(201).send('User created successfully');
  } catch (err) {
    switch (err.code) {
      case 'auth/invalid-email':
        console.log(`The supplied email address was badly formatted - terminating with a 400`);
        return res.status(400).send('Invalid email address');
      case 'auth/email-already-exists':
        console.log(`The supplied email address is already taken - terminating with a 409`);
        return res.status(409).send('Email already exists');
      default:
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
  }
};

exports.handler = async (event, context) => {
  const req = {
    query: event.queryStringParameters,
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
    path: event.path
  };

  const res = {
    status: (code) => ({
      json: (data) => ({
        statusCode: code,
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
      }),
      send: (message) => ({
        statusCode: code,
        body: message,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
      })
    })
  };

  if (event.httpMethod === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  return await signUp(req, res);
};





// const createUser = require('../helpers/createUser');
// const createUserDoc = require('../helpers/createUserDoc');


// const signUp = (db, admin) => async (req, res) => {

//     try {

//         console.log(`Creating new user...`);

//         const body = JSON.parse(req.body);
//         const email = body.email;
//         const password = body.password;
//         const firstName = body.firstName;
//         const lastName = body.lastName;
//         const displayName = `${firstName.trim()} ${lastName.trim()}`;

//         const userAccount = await createUser(admin, email, password, displayName);

//         const id = userAccount.uid;
//         await createUserDoc(db, id, body);

//         console.log(`Successfully created new user, created their corresponding user doc in Firestore and sent sign up email - terminating with a 201`);
//         res.sendStatus(201);


//     } catch (err) {

//         switch (err.code) {

//             case 'auth/invalid-email':
//                 console.log(`The supplied email address was badly formatted - terminating with a 400`)
//                 res.sendStatus(400);
//                 break;

//             case 'auth/email-already-exists':
//                 console.log(`The supplied email address is already taken - terminating with a 409`)
//                 res.sendStatus(409);
//                 break;

//             default:
//                 console.log(err);
//                 res.sendStatus(500);

//         }

//     }

// }

// module.exports = signUp;