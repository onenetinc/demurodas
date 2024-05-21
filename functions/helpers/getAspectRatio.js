const Jimp = require('jimp');
const path = require('path');
const os = require('os');

const getAspectRatio = (fileName) => {

    return new Promise(async (resolve, reject) => {

        Jimp.read(path.join(os.tmpdir(), `original/${fileName}`))
            .then(image => {

                const w = image.bitmap.width;
                const h = image.bitmap.height;
                const aspectRatio = w / h;
                resolve(aspectRatio);

            }).catch(err => {

                reject(err);

            });

    });

}

module.exports = getAspectRatio;