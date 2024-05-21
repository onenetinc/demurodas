const deleteUserDoc = (db, id) => {

    return new Promise(async (resolve, reject) => {

        try {

            await db.collection('users').doc(id).delete();
            console.log(`Deleted user doc from Firestore`);
            resolve();

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = deleteUserDoc;