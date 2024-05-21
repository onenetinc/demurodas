const getMapping = (db) => {

    return new Promise((resolve, reject) => {

        try {

            let tries = 0;

            const getDoc = async () => {

                const doc = await db.collection('cmsMapping').doc('items').get();

                if (!doc.exists && tries < 30) {

                    console.log(`User doc data was empty, trying again`);
                    tries++;
                    getDoc();

                } else {

                    const data = await doc.data();
                    console.log(`Retrieved CMS mapping`);
                    resolve(data);

                }
            }

            getDoc();

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = getMapping;