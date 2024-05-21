const path = require('path');
const os = require('os');
const fs = require('fs');

const downloadImage = (url, id) => {

    return new Promise(async(resolve, reject) => {

        try {

            const res = await fetch(url);
            const parts = url.split('.');
            const extension = parts.pop();
            const fileName = id + '.' + extension;
            const tempFilePath = path.join(os.tmpdir(), `original/${fileName}`);
            
            const fileStream = fs.createWriteStream(tempFilePath);

            res.body.pipe(fileStream);

            res.body.on('error', (err) => {

                reject(err);

            });

            fileStream.on('finish', () => {

                console.log(`Successfully downloaded image to temp directory`);
                resolve(fileName);

            });

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = downloadImage;