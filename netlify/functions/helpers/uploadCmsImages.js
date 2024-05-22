const path = require('path');
const os = require('os');

let errors = 0;

const uploadCmsImages = (bucket, fileName) => {

    return new Promise(async (resolve, reject) => {

        try {

            const toUpload = [
                `500/${fileName}`,
                `250/${fileName}`,
                `100/${fileName}`,
                `20/${fileName}`,
            ];

            let proms = [];

            toUpload.forEach(imagePath => {

                proms.push(

                    bucket.upload(path.join(os.tmpdir(), imagePath), {

                        destination: imagePath,
                        public: true

                    })

                );

            });

            await Promise.all(proms);

            console.log(`Successfully uploaded resized images to Firebase Storage`);
            resolve();


        } catch (err) {

            errors++;

            if (errors < 30) {

                console.log(`Caught an error uploading files to storage, rerunning this function again. This was try number ${errors} of 30.`);

                console.log('ERROR: ' + err);

                setTimeout(() => {

                    uploadCmsImages(bucket, fileName);

                }, 200);

            } else {

                console.error(err);
                reject(err);

            }


        }

    });

}

module.exports = uploadCmsImages;