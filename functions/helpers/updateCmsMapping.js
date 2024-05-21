const updateCmsMapping = (db, id, aspectRatio) => {

    return new Promise(async(resolve, reject) => {

        try {

            const update = {};
            update[`${id}.processed`] = true;
            update[`${id}.aspectRatio`] = aspectRatio;

            await db.collection('cmsMapping').doc('items').update(update);
            console.log(`Successfully upated Firestore Doc with image aspect ratio and set "processed" to true`);

            resolve();

        } catch (err) {

            reject(err);

        }

    });

}

module.exports = updateCmsMapping;