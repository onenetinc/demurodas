const getWelcomeNotSent = (db) => {

    return new Promise(async (resolve, reject) => {

        try {

            console.log(`Getting users who have not yet had a welcome email sent...`);

            let result = [];

            const query = await db.collection('users').where('welcomeSent', '==', false).get();

            query.forEach(doc => {

                result.push(doc.id);
                
            });

            resolve(result);

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = getWelcomeNotSent;
