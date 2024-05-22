const { db, bucket } = require('../helpers/firebase');
const path = require('path');
const os = require('os');
const fs = require('fs');

const downloadImage = require('./helpers/downloadImage');
const resizeImage = require('./helpers/resizeImage');
const uploadCmsImages = require('./helpers/uploadCmsImages');
const updateCmsMapping = require('./helpers/updateCmsMapping');
const getAspectRatio = require('./helpers/getAspectRatio');
const removeTempCmsImages = require('./helpers/removeTempCmsImages');

const uploadToStorage = async (message) => {
  console.log("TESSST");

  return new Promise(async (resolve, reject) => {
    try {
      const messageBody = JSON.parse(Buffer.from(message.data, 'base64').toString());

      console.log(messageBody);

      const id = messageBody.id;
      const imgUrl = messageBody.imgUrl;

      console.log('imgUrl:', imgUrl);

      const dirs = ['original', '500', '250', '100', '20'];

      dirs.forEach(dir => {
        if (!fs.existsSync(path.join(os.tmpdir(), dir))) {
          fs.mkdirSync(path.join(os.tmpdir(), dir));
        }
      });

      console.log("ERROR 1");
      const fileName = await downloadImage(imgUrl, id);
      console.log("ERROR 2");
      const aspectRatio = await getAspectRatio(fileName);
      console.log("ERROR 3");
      await resizeImage(fileName);
      console.log("ERROR 4");
      await uploadCmsImages(bucket, fileName);
      console.log("ERROR 5");
      await updateCmsMapping(db, id, aspectRatio);
      console.log("ERROR 6");
      await removeTempCmsImages(fileName);
      console.log("ERROR 7");

      resolve({
        statusCode: 200,
        body: JSON.stringify({ message: 'Upload to storage and processing complete' })
      });
    } catch (err) {
      console.log('ERROR: ' + err);

      reject({
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error', error: err.message })
      });
    }
  });
};

exports.handler = async (event, context) => {
  const message = JSON.parse(event.body);

  if (!message || !message.data) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid request payload' })
    };
  }

  return await uploadToStorage(message);
};





// const path = require('path');
// const os = require('os');
// const fs = require('fs');

// const downloadImage = require('../helpers/downloadImage');
// const resizeImage = require('../helpers/resizeImage');
// const uploadCmsImages = require('../helpers/uploadCmsImages');
// const updateCmsMapping = require('../helpers/updateCmsMapping');
// const getAspectRatio = require('../helpers/getAspectRatio');
// const removeTempCmsImages = require('../helpers/removeTempCmsImages');

// const uploadToStorage = (db, bucket) => (message) => {

//     console.log("TESSST");

//     return new Promise(async (resolve, reject) => {

//         try {

//             const messageBody = JSON.parse(Buffer.from(message.data, 'base64').toString());

//             console.log(messageBody);

//             const id = messageBody.id;
//             const imgUrl = messageBody.imgUrl;

//             console.log('imgUrl:', imgUrl);

//             const dirs = [
//                 'original',
//                 '500',
//                 '250',
//                 '100',
//                 '20'
//             ];

//             dirs.forEach(dir => {

//                 if (!fs.existsSync(path.join(os.tmpdir(), dir))) {

//                     fs.mkdirSync(path.join(os.tmpdir(), dir));

//                 }

//             });

//             console.log("ERROR 1");
            
//             const fileName = await downloadImage(imgUrl, id);
//             console.log("ERROR 2");
            
//             const aspectRatio = await getAspectRatio(fileName);
//             console.log("ERROR 3");
            
//             await resizeImage(fileName);
//             console.log("ERROR 4");
            
//             await uploadCmsImages(bucket, fileName);
//             console.log("ERROR 5");
            
//             await updateCmsMapping(db, id, aspectRatio);
//             console.log("ERROR 6");
            
//             await removeTempCmsImages(fileName);
//             console.log("ERROR 7");

//             resolve();

//         } catch (err) {

//             console.log('ERROR: ' + err);

//             reject(err);

//         }

//     });

// }

// module.exports = uploadToStorage;