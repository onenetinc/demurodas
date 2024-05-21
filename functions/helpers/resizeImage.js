const Jimp = require('jimp');
const path = require('path');
const os = require('os');

const resizeImage = (fileName) => {

    return new Promise(async (resolve, reject) => {

        try {

            let sizes = [
                500,
                250,
                100,
                20
            ];

            let proms = [];

            sizes.forEach(size => {

                proms.push(

                    new Promise((resolve, reject) => {

                        Jimp.read(path.join(os.tmpdir(), `original/${fileName}`))
                            .then(image => {

                                return image
                                    .resize(Jimp.AUTO, size * 2) // Increase this to increase image quality (but increase page load times at the same time)
                                    .quality(100)
                                    .write(path.join(os.tmpdir(), `${size}/${fileName}`))

                            }).then(() => {

                                console.log(`Successfully resized image to ${size}px and saved to temp dir`);
                                resolve();

                            }).catch(err => {

                                reject(err);

                            });

                    })

                );

            });


            await Promise.all(proms);

            resolve();


        } catch (err) {

            reject(err);

        }

    });

}

module.exports = resizeImage;