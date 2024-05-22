const createUserDoc = (db, id, body) => {

    return new Promise(async (resolve, reject) => {

        try {

            const userDoc = {
                welcomeSent: false,
                company: body.company.trim(),
                americas: body.americas,
                website: body.website.trim(),
                resale: body.resale.trim()
            };

            await db.collection('users').doc(id).set(userDoc);
            console.log(`Created user doc in Firestore with these details:`);
            console.log(JSON.stringify(userDoc, null, 4));

            resolve();

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = createUserDoc;