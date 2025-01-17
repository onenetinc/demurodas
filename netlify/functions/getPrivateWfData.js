const { admin } = require('./helpers/firebase');
const verifyToken = require('./helpers/verifyToken');
const getProductPricing = require('./helpers/getProductPricing');

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

  // 1. Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
      },
      body: 'OK'
    };
  }

  const req = {
    query: event.queryStringParameters,
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
    path: event.path
  };

  // 2. Add CORS headers to your normal responses
  const res = {
    status: (code) => ({
      json: (data) => ({
        statusCode: code,
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        }
      }),
      send: (message) => ({
        statusCode: code,
        body: message,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
      })

    })
  };

  // const req = {
  //   query: event.queryStringParameters,
  //   method: event.httpMethod,
  //   headers: event.headers,
  //   body: event.body,
  //   path: event.path
  // };

  // const res = {
  //   status: (code) => ({
  //     json: (data) => ({
  //       statusCode: code,
  //       body: JSON.stringify(data),
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Access-Control-Allow-Origin': '*'
  //       }
  //     }),
  //     send: (message) => ({
  //       statusCode: code,
  //       body: message,
  //       headers: {
  //         'Access-Control-Allow-Origin': '*'
  //       }
  //     })
  //   })
  // };

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