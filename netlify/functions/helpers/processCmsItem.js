const { db, bucket } = require('./firebase');
const path = require('path');
const os = require('os');
const fs = require('fs');

const downloadImage = require('./downloadImage');
const resizeImage = require('./resizeImage');
const uploadCmsImages = require('./uploadCmsImages');
const updateCmsMapping = require('./updateCmsMapping');
const getAspectRatio = require('./getAspectRatio');
const removeTempCmsImages = require('./removeTempCmsImages');

const processCmsItem = async (id, imgUrl) => {
  console.log("TESSST");

  return new Promise(async (resolve, reject) => {
    try {

      console.log('imgUrl:', imgUrl);

      const dirs = ['original', '500', '250', '100', '20'];

      dirs.forEach(dir => {
        if (!fs.existsSync(path.join(os.tmpdir(), dir))) {
          fs.mkdirSync(path.join(os.tmpdir(), dir));
        }
      });

      console.log("Processing CMS Item - ID:", id);
      console.log("Received imgUrl:", imgUrl);

      if (!imgUrl) {
        throw new Error("Invalid or missing imgUrl");
      }


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

module.exports = processCmsItem;

