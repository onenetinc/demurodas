const updateUserDoc = (db, id, body) => {

    return new Promise(async (resolve, reject) => {

        try {

            const userDoc = await db.collection('users').doc(id);

            const update = {
                company: body.company.trim(),
                americas: body.americas,
                website: body.website.trim(),
                resale: body.resale.trim(),
            };

            await userDoc.set(update, { merge: true });

            console.log(`Updated user doc in Firestore with these details:`);
            console.log(JSON.stringify(update, null, 4));

            resolve();

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = updateUserDoc;