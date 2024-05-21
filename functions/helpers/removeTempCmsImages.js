const path = require('path');
const os = require('os');
const fs = require('fs');

const removeTempCmsImages = (fileName) => {

    return new Promise(async(resolve, reject) => {

        try {

            const toRemove = [
                `original/${fileName}`,
                `500/${fileName}`,
                `250/${fileName}`,
                `100/${fileName}`,
                `20/${fileName}`,
            ];

            let proms = [];

            toRemove.forEach(image => {
                
                proms.push(

                    fs.unlinkSync(path.join(os.tmpdir(), image))

                );

            }); 

            await Promise.all(proms);

            console.log(`Successfully removed resized images from temp dir`);
            resolve();

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = removeTempCmsImages;