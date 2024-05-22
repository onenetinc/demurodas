const { admin, db } = require('./helpers/firebase');
const verifyToken = require('./helpers/verifyToken');
const getUserDoc = require('./helpers/getUserDoc');


const getProfile = async (req, res) => {
  try {
    const id = req.query.id;
    const token = req.query.token;
    const isAuthed = await verifyToken(admin, token);

    if (!id) {
      console.log(`No user ID was provided - terminating with a 400`);
      return res.status(400).send('No user ID was provided');
    } else if (!isAuthed) {
      console.log(`The token was not valid - terminating with a 401`);
      return res.status(401).send('Unauthorized');
    } else {
      const userDoc = await getUserDoc(db, id);

      if ('history' in userDoc) {
        delete userDoc.history;
      }

      console.log(`Found user doc with id ${id} - terminating with a 200`);
      return res.status(200).json(userDoc);
    }
  } catch (err) {
    console.error(err);
    console.log(`Could not find a user doc with id ${req.query.id} - terminating with a 404`);
    return res.status(404).send('User not found');
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

  await getProfile(req, res);
};





// const verifyToken = require('../helpers/verifyToken');
// const getUserDoc = require('../helpers/getUserDoc');

// const getProfile = (db, admin) => async (req, res) => {

//     try {

//         const id = req.query.id;
//         const token = req.query.token;
//         const isAuthed = await verifyToken(admin, token);

//         if (!id) {

//             console.log(`No item sku was provided - terminating with a 400`);
//             return res.sendStatus(401);

//         } else if (!isAuthed) {

//             console.log(`The token was not valid - terminating with a 401`);
//             return res.sendStatus(401);

//         } else {

//             const userDoc = await getUserDoc(db, id);

//             if ('history' in userDoc) {
//                 delete userDoc.history;
//             }

//             console.log(`Found user doc with id ${id} - terminating with a 200`);
//             return res.json(JSON.stringify(userDoc));

//         }

//     } catch (err) {

//         console.error(err);
//         console.log(`Could not find a user doc with id ${req.query.id} - terminating with a 404`);
//         return res.sendStatus(404);

//     }

// }

// module.exports = getProfile;