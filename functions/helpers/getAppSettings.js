const getAppSettings = (db) => {

    return new Promise(async (resolve, reject) => {

        let tries = 0;

        try {

            const getData = async() => {

                console.log(`Getting current app settings from Firestore...`);

                let appSettings = {};

                const collection = await db.collection('settings').get();

                collection.forEach(doc => {

                    const docData = doc.data();

                    for (const key of Object.keys(docData)) {

                        appSettings[key] = docData[key];
                        
                    }

                });

                resolve(appSettings);

            }

            getData();

        } catch (err) {

            if (tries < 30) {

                console.log(`Error getting app settings, trying again. This was attempt ${tries} of 30.`);
                getData();

            } else {

                reject(err);

            }

        }

    });

}

module.exports = getAppSettings;
