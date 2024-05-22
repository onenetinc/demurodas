const { admin, db } = require('./helpers/firebase');
const verifyToken = require('./helpers/verifyToken');
const updateUserProfile = require('./helpers/updateUserProfile');
const updateUserDoc = require('./helpers/updateUserDoc');


const updateProfile = async (req, res) => {
  try {
    console.log(`Saving profile update...`);

    const body = JSON.parse(req.body);
    const token = body.token;
    const id = await verifyToken(admin, token);

    const proms = [
      updateUserProfile(admin, id, body),
      updateUserDoc(db, id, body)
    ];

    await Promise.all(proms);

    console.log(`Successfully updated user profile in Firebase and updated their corresponding user doc in Firestore - terminating with a 200`);
    return res.status(200).send('Profile updated successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
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
          'Access-Control-Allow-Origin': '*'
        }
      }),
      send: (message) => ({
        statusCode: code,
        body: message,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
    })
  };

  await updateProfile(req, res);
};





// const verifyToken = require('../helpers/verifyToken');
// const updateUserProfile = require('../helpers/updateUserProfile');
// const updateUserDoc = require('../helpers/updateUserDoc');

// const updateProfile = (db, admin) => async (req, res) => {

//     try {

//         console.log(`Saving profile update...`);

//         const body = JSON.parse(req.body);
//         const token = body.token;
//         const id = await verifyToken(admin, token);


//         let proms = [
//             updateUserProfile(admin, id, body),
//             updateUserDoc(db, id, body)
//         ];

//         await Promise.all(proms);

//         console.log(`Successfully updated user profile in Firebase and updated their corresponding user doc in Firestore - terminating with a 200`);
//         res.sendStatus(200);


//     } catch (err) {

//         console.error(err);
//         res.sendStatus(500);

//     }

// }

// module.exports = updateProfile;