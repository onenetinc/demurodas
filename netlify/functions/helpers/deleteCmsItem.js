const { bucket } = require('./firebase');

const deleteCmsItem = (fileName) => {

  return new Promise(async (resolve, reject) => {

      try {

          console.log(`Deleting all sizes of image ${fileName}`);

          const filePaths = [
              `500/${fileName}`,
              `250/${fileName}`,
              `100/${fileName}`,
              `20/${fileName}`
          ];

          let proms = [];

          filePaths.forEach(filePath => {

              proms.push(

                  bucket.file(filePath).delete()

              );

          });

          console.log(`Removed resized images from Firebase Storage for deleted cms item`)

          await Promise.all(proms);

          resolve();


      } catch (err) {

          console.log('ERROR: ' + err);

          console.error(err);
          reject(err);

      }

  });

}

module.exports = deleteCmsItem;
