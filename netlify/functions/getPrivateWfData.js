const admin = require('firebase-admin');
const verifyToken = require('./helpers/verifyToken');
const getProductPricing = require('./helpers/getProductPricing');

const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'demurodas.appspot.com'
});

const db = admin.firestore();

const getPrivateWfData = async (req, res) => {
  try {
    const sku = req.query.sku;
    const token = req.query.token;
    const isAuthed = await verifyToken(admin, token);

    if (!sku) {
      console.log(`No item sku was provided - terminating with a 400`);
      return res.status(400).send('No item SKU was provided');
    } else if (!isAuthed) {
      console.log(`The token was not valid - terminating with a 401`);
      return res.status(401).send('Unauthorized');
    }

    const pricing = await getProductPricing({ sku });

    if (!pricing) {
      return res.status(404).send('Pricing not found');
    }

    console.log('Terminating with a 200');
    return res.status(200).json(pricing);
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

  await getPrivateWfData(req, res);
};




// const verifyToken = require('../helpers/verifyToken');
// const getProductPricing = require('../helpers/getProductPricing');


// const getPrivateWfData = (admin) => async (req, res) => {

//     try {

//         const sku = req.query.sku;
//         const token = req.query.token;
//         const isAuthed = await verifyToken(admin, token);

//         if (!sku) {

//             console.log(`No item sku was provided - terminating with a 400`);
//             throw 401;

//         } else if (!isAuthed) {

//             console.log(`The token was not valid - terminating with a 401`);
//             throw 401;

//         }

//         const pricing = await getProductPricing({sku: sku});

//         if (!pricing) throw 404

//         console.log('Terminating with a 200');

//         return res.json(pricing);

//     } catch (err) {

//         console.error(err);
//         return res.sendStatus(err);

//     }

// }

// module.exports = getPrivateWfData;