const getUserDoc = (db, id) => {

    return new Promise((resolve, reject) => {

        let tries = 0;

        try {

            const getDoc = async () => {

                const doc = await db.collection('users').doc(id).get();

                if (!doc.exists) {

                    console.log(`User doc doesn't exist`);
                    resolve(null);

                } else {

                    const data = await doc.data();
                    console.log(`Retrieved user doc for ${id}`);
                    resolve(data);

                }

            }

            getDoc();

        } catch (err) {

            tries++;

            if (tries < 30) {

                console.log(`Error getting user doc, trying again. This was attempt ${tries} of 30.`);
                getDoc();

            } else {

                reject(err);

            }

        }

    });

}

module.exports = getUserDoc;