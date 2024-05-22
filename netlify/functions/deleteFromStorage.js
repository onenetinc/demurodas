const deleteFromStorage = (bucket) => (message) => {

    return new Promise(async (resolve, reject) => {

        try {

            const messageBody = JSON.parse(Buffer.from(message.data, 'base64').toString());
            const fileName = messageBody.fileName;

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

module.exports = deleteFromStorage;
