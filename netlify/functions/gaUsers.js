const { admin, db } = require('./helpers/firebase');
const getAppSettings = require('./helpers/getAppSettings');
const getEnabledUsers = require('./helpers/getEnabledUsers');
const getUserDoc = require('./helpers/getUserDoc');


const getUsers = async (req, res) => {
  try {
    const secret = req.query.secret;
    if (!secret) {
      return res.status(400).send('Missing secret parameter');
    }

    const appSettings = await getAppSettings(db);
    const allowedSecrets = appSettings.allowed;
    if (!allowedSecrets.includes(secret)) {
      return res.status(401).send('Unauthorized');
    }

    const users = await getEnabledUsers(admin);
    let resp = {};
    const getUserData = Object.entries(users).map(async user => {
      try {
        const userDoc = await getUserDoc(db, user[0]);
        resp[user[0]] = `${user[1].displayName} | ${userDoc.company} | ${user[0]}`;
      } catch (err) {
        console.error(err);
      }
    });

    await Promise.all(getUserData);
    console.log(resp);
    return res.status(200).json(resp);
  } catch (err) {
    console.log(`Responding with error code ${err}`);
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
    }),
    sendStatus: (code) => ({
      statusCode: code,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  };

  await getUsers(req, res);
};





// const getAppSettings = require('../helpers/getAppSettings');
// const getEnabledUsers = require('../helpers/getEnabledUsers');
// const getUserDoc = require('../helpers/getUserDoc');


// const gaUsers = (db, admin) => async (req, res) => {
//     try {
//         const secret = req.query.secret;
//         if (!secret) throw 400

//         const appSettings = await getAppSettings(db);
//         const allowedSecrets = appSettings.allowed;
//         if (!allowedSecrets.includes(secret)) throw 401

//         const users = await getEnabledUsers(admin);
//         let resp = {};
//         const getUserData = Object.entries(users).map(async user => {
//             try {
//                 const userDoc = await getUserDoc(db, user[0]);
//                 return resp[user[0]] = `${user[1].displayName} | ${userDoc.company} | ${user[0]}`;
//             }
//             catch (err) {
//                 return console.error(err);
//             }
//         });
//         await Promise.all(getUserData);
//         console.log(resp);
//         return res.json(resp);

//     } catch (err) {
//         console.log(`Responding with error code ${err}`)
//         res.sendStatus(err);
//     }
// }

// module.exports = gaUsers;
