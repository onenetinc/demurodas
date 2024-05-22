const { admin } = require('./helpers/firebase');
const jszip = require('jszip');
const path = require('path');
const os = require('os');
const fs = require('fs');
const verifyToken = require('./helpers/verifyToken');
const getBase64Buffer = require('./helpers/getBase64Buffer');
const getUrls = require('./helpers/getUrls');


const createZip = async (req, res) => {
  try {
    const urlsQuery = req.query.urls;
    const token = req.query.token;

    if (!urlsQuery || !token) {
      console.log('Request is missing required parameters');
      throw 400;
    }

    if (!(await verifyToken(admin, token))) {
      console.log('Token presented is invalid');
      throw 401;
    }

    const urls = getUrls(urlsQuery);

    if (urls.length === 0) {
      console.log('There were no image URLs to download');
      throw 404;
    }

    var zip = new jszip();
    let proms = [];

    urls.forEach((url, index) => {
      proms.push(
        new Promise(async (resolve, reject) => {
          try {
            const data = await getBase64Buffer(url);

            if (!data) {
              resolve();
            } else {
              const ext = decodeURIComponent(url).split('.').pop();
              const name = String(index + 1) + '.' + ext;
              zip.file(name, data, { base64: true });
              console.log(`Downloaded image ${index + 1} of ${urls.length}`);
              resolve();
            }
          } catch (err) {
            reject(500);
          }
        })
      );
    });

    await Promise.all(proms);

    const zipName = `${Math.floor(Math.random() * 10000000 + 1)}.zip`;
    const tempFilePath = path.join(os.tmpdir(), zipName);

    zip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream(tempFilePath))
      .on('finish', () => {
        console.log(`Wrote ${zipName} to temp dir`);

        res.sendFile(tempFilePath, (err) => {
          if (err) {
            console.log('Error sending file as response');
            return res.status(500).send('Error sending file');
          }

          console.log(`Sent zip file to client, removing ${zipName} from temp dir`);
          fs.unlinkSync(tempFilePath);
        });
      })
      .on('error', (err) => {
        console.error(err);
        return res.status(500).send('Error creating zip file');
      });
  } catch (err) {
    console.error(err);
    return res.status(err).send('Error processing request');
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
    sendFile: (filePath, callback) => {
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('open', () => {
        callback(null);
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/zip',
            'Access-Control-Allow-Origin': '*'
          },
          body: fileStream
        };
      });
      fileStream.on('error', (err) => {
        callback(err);
        return {
          statusCode: 500,
          body: 'Error sending file',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        };
      });
    }
  };

  await createZip(req, res);
};






// const verifyToken = require('../helpers/verifyToken');
// const getBase64Buffer = require('../helpers/getBase64Buffer');
// const getUrls = require('../helpers/getUrls');

// const jszip = require('jszip');
// const path = require('path');
// const os = require('os');
// const fs = require('fs');

// const createZip = (admin) => async (req, res) => {

//     try {

//         const urlsQuery = req.query.urls;
//         const token = req.query.token;

//         if (!urlsQuery || !token) {

//             console.log('Request is missing required paramaters');
//             throw 400;

//         }


//         if (!(await verifyToken(admin, token))) {

//             console.log('Token presented is invalid');
//             throw 401;

//         }

//         const urls = getUrls(urlsQuery);

//         if (urls.length === 0) {

//             console.log('There were no image urls to download');
//             throw 404;

//         }

//         var zip = new jszip();

//         let proms = [];

//         urls.forEach(async (url, index) => {

//             proms.push(

//                 new Promise(async (resolve, reject) => {

//                     try {

//                         const data = await getBase64Buffer(url);

//                         if (!data) {

//                             resolve();

//                         } else {

//                             const ext = decodeURIComponent(url).split('.').pop();
//                             const name = String(index + 1) + '.' + ext;
//                             zip.file(name, data, { base64: true });
//                             console.log(`Downloaded image ${index + 1} of ${urls.length}`);
//                             resolve();

//                         }

//                     } catch (err) {

//                         throw 500;

//                     }

//                 })

//             );

//         });


//         await Promise.all(proms);

//         console.log(zip);

//         const zipName = `${Math.floor((Math.random() * 10000000) + 1)}.zip`;

//         const tempFilePath = path.join(os.tmpdir(), zipName);

//         zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
//             .pipe(fs.createWriteStream(tempFilePath))
//             .on('finish', () => {

//                 console.log(`Wrote ${zipName} to temp dir`);

//                 res.sendFile(tempFilePath, (err) => {

//                     if (err) {

//                         console.log('Error sending file as response');
//                         throw 500;

//                     }

//                     console.log(`Sent zip file to client, removing ${zipName} from temp dir`);

//                     return fs.unlinkSync(tempFilePath);

//                 });
//             })
//             .on('error', (err) => {

//                 console.error(err);
//                 throw 500;

//             });

//     } catch (err) {

//         console.error(err);
//         return res.sendStatus(err);

//     }

// }

// module.exports = createZip;

