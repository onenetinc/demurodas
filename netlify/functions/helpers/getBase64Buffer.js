const fetch = require('node-fetch');

const getBase64Buffer = (url) => {

    return new Promise(async (resolve, reject) => {

        try {

            const response = await fetch(url);
            const status = response.status;

            console.log(`Status ${status} for url: ${url}`);

            if (status !== 200) resolve(false);

            const data = await response.buffer();
            const b64 = new Buffer.from(data, 'binary').toString('base64');
            resolve(b64);

        } catch (err) {

            console.error(err);
            reject(err);

        }
    });

}

module.exports = getBase64Buffer;