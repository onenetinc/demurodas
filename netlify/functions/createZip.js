const { admin } = require('./helpers/firebase');
const jszip = require('jszip');
const path = require('path');
const os = require('os');
const fs = require('fs');
const verifyToken = require('./helpers/verifyToken');
const getBase64Buffer = require('./helpers/getBase64Buffer');
const getUrls = require('./helpers/getUrls');

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

  try {
    const { urls, token } = event.queryStringParameters || {};
    if (!urls || !token) {
      console.log('Missing required parameters');
      return errorResponse(400, 'Missing required parameters');
    }

    // Verify Firebase token
    if (!(await verifyToken(admin, token))) {
      console.log('Invalid token');
      return errorResponse(401, 'Invalid token');
    }

    const urlArray = getUrls(urls);
    if (!urlArray.length) {
      console.log('No URLs found');
      return errorResponse(404, 'No URLs found');
    }

    // Download images and add them to zip
    const zip = new jszip();
    for (let i = 0; i < urlArray.length; i++) {
      const url = urlArray[i];
      const data = await getBase64Buffer(url);
      if (data) {
        const ext = decodeURIComponent(url).split('.').pop();
        const name = `${i + 1}.${ext}`;
        zip.file(name, data, { base64: true });
        console.log(`Downloaded image ${i + 1} of ${urlArray.length}`);
      }
    }

    // Generate the ZIP as a buffer
    const content = await zip.generateAsync({ type: 'nodebuffer' });
    const base64Zip = content.toString('base64');

    // Return the base64-encoded ZIP
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="download.zip"',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
      },
      body: base64Zip,
      isBase64Encoded: true
    };

  } catch (err) {
    console.error(err);
    return errorResponse(500, 'Error processing request');
  }
};

function errorResponse(statusCode, message) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    },
    body: message
  };
}





// const { admin } = require('./helpers/firebase');
// const jszip = require('jszip');
// const path = require('path');
// const os = require('os');
// const fs = require('fs');
// const verifyToken = require('./helpers/verifyToken');
// const getBase64Buffer = require('./helpers/getBase64Buffer');
// const getUrls = require('./helpers/getUrls');


// const createZip = async (req, res) => {
//   try {
//     const urlsQuery = req.query.urls;
//     const token = req.query.token;

//     if (!urlsQuery || !token) {
//       console.log('Request is missing required parameters');
//       throw 400;
//     }

//     if (!(await verifyToken(admin, token))) {
//       console.log('Token presented is invalid');
//       throw 401;
//     }

//     const urls = getUrls(urlsQuery);

//     if (urls.length === 0) {
//       console.log('There were no image URLs to download');
//       throw 404;
//     }

//     var zip = new jszip();
//     let proms = [];

//     urls.forEach((url, index) => {
//       proms.push(
//         new Promise(async (resolve, reject) => {
//           try {
//             const data = await getBase64Buffer(url);

//             if (!data) {
//               resolve();
//             } else {
//               const ext = decodeURIComponent(url).split('.').pop();
//               const name = String(index + 1) + '.' + ext;
//               zip.file(name, data, { base64: true });
//               console.log(`Downloaded image ${index + 1} of ${urls.length}`);
//               resolve();
//             }
//           } catch (err) {
//             reject(500);
//           }
//         })
//       );
//     });

//     await Promise.all(proms);

//     const zipName = `${Math.floor(Math.random() * 10000000 + 1)}.zip`;
//     const tempFilePath = path.join(os.tmpdir(), zipName);

//     zip
//       .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
//       .pipe(fs.createWriteStream(tempFilePath))
//       .on('finish', () => {
//         console.log(`Wrote ${zipName} to temp dir`);

//         // Read, encode, and return the file
//         const fileBuffer = fs.readFileSync(tempFilePath);
//         const base64Zip = fileBuffer.toString('base64');
//         fs.unlinkSync(tempFilePath);
//         // Use your response helper to return the proper object
//         return res.status(200).send({
//           headers: {
//             'Content-Type': 'application/zip',
//             'Content-Disposition': 'attachment; filename="download.zip"',
//             'Access-Control-Allow-Origin': '*',
//             'Access-Control-Allow-Headers': 'Content-Type',
//             'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
//           },
//           body: base64Zip,
//           isBase64Encoded: true
//         });

//         // res.sendFile(tempFilePath, (err) => {
//         //   if (err) {
//         //     console.log('Error sending file as response');
//         //     return res.status(500).send('Error sending file');
//         //   }

//         //   console.log(`Sent zip file to client, removing ${zipName} from temp dir`);
//         //   fs.unlinkSync(tempFilePath);
//         // });
//       })
//       .on('error', (err) => {
//         console.error(err);
//         return res.status(500).send('Error creating zip file');
//       });
//   } catch (err) {
//     console.error(err);
//     return res.status(err).send('Error processing request');
//   }
// };

// exports.handler = async (event, context) => {


//   // 1. Handle OPTIONS preflight
//   if (event.httpMethod === 'OPTIONS') {
//     return {
//       statusCode: 200,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Headers': 'Content-Type',
//         'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
//       },
//       body: 'OK'
//     };
//   }

//   const req = {
//     query: event.queryStringParameters,
//     method: event.httpMethod,
//     headers: event.headers,
//     body: event.body,
//     path: event.path
//   };

//   const res = {
//     status: (code) => ({
//       json: (data) => ({
//         statusCode: code,
//         body: JSON.stringify(data),
//         headers: {
//           'Content-Type': 'application/json',
//           'Access-Control-Allow-Origin': '*',
//           'Access-Control-Allow-Headers': 'Content-Type',
//           'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
//         }
//       }),
//       send: (message) => ({
//         statusCode: code,
//         body: message,
//         headers: {
//           'Access-Control-Allow-Origin': '*',
//           'Access-Control-Allow-Headers': 'Content-Type',
//           'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
//         },
//       })
//     }),
//     sendFile: (filePath, callback) => {
//       const fileStream = fs.createReadStream(filePath);
//       fileStream.on('open', () => {
//         callback(null);
//         return {
//           statusCode: 200,
//           headers: {
//             'Content-Type': 'application/zip',
//             'Access-Control-Allow-Origin': '*',
//             'Access-Control-Allow-Headers': 'Content-Type',
//             'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
//           },
//           body: fileStream
//         };
//       });
//       fileStream.on('error', (err) => {
//         callback(err);
//         return {
//           statusCode: 500,
//           body: 'Error sending file',
//           headers: {
//             'Access-Control-Allow-Origin': '*',
//             'Access-Control-Allow-Headers': 'Content-Type',
//             'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
//           }
//         };
//       });
//     }
//   };

//   return await createZip(req, res);
// };