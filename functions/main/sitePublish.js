const getWfItems = require('../helpers/getWfItems');
const getMapping = require('../helpers/getMapping');
const createNewMapping = require('../helpers/createNewMapping');
const checkForDeletions = require('../helpers/checkForDeletions');
const checkforNewItems = require('../helpers/checkforNewItems');
const checkForUpdatedItems = require('../helpers/checkForUpdatedItems');
const publishMessage = require('../helpers/publishMessage');


const sitePublish = (db) => async (res) => {

    try {

        console.log(`Webflow site was published, processing any changes to the Products CMS collection...`);

        const proms = [
            getWfItems(),
            getMapping(db)
        ];

        const results = await Promise.all(proms);

        const currentCmsItems = results[0];
        const savedMapping = results[1];
        const updatedMapping = createNewMapping(currentCmsItems);

        let toProcess = [];

        const deletions = checkForDeletions(savedMapping, updatedMapping);

        if (null !== deletions) {

            deletions.forEach(id => {

                const imgUrl = savedMapping[id].imgUrl;
                if (imgUrl) {
                    const parts = imgUrl.split('.');
                    const extension = parts.pop();
                    const fileName = id + '.' + extension;
                    toProcess.push(publishMessage('deleteCmsItem', { fileName: fileName }));
                }
                delete savedMapping[id];
                
            });

        }

        const updatedCmsItems = checkForUpdatedItems(savedMapping, updatedMapping);

        if (null !== updatedCmsItems) {

            updatedCmsItems.forEach(id => {

                savedMapping[id] = updatedMapping[id];
                toProcess.push(publishMessage('processCmsItem', { id: id, imgUrl: updatedMapping[id].imgUrl }));
                toProcess.push(publishMessage('generateProductPdfs', { slug: updatedMapping[id].slug }));

            });

        }

        const newCmsItems = checkforNewItems(savedMapping, updatedMapping);

        if (null !== newCmsItems) {

            newCmsItems.forEach(id => {

                savedMapping[id] = updatedMapping[id];
                toProcess.push(publishMessage('processCmsItem', { id: id, imgUrl: updatedMapping[id].imgUrl }));
                toProcess.push(publishMessage('generateProductPdfs', { slug: updatedMapping[id].slug }));

            });

        }

        db.collection('cmsMapping').doc('items').set(savedMapping);

        console.log(`To process: ${toProcess.length}`);

        if (newCmsItems) {

            console.log(`New items: ${newCmsItems.length}`);

        }

        if (updatedCmsItems) {

            console.log(`Updated items: ${updatedCmsItems.length}`);

        }

        if (deletions) {

            console.log(`Deleted items: ${deletions.length}`);

        }

        if (toProcess.length > 0) {

            await Promise.all(toProcess);
            console.log(`Sent all messages`);

        }

        return res.sendStatus(200);

    } catch (err) {

        console.error(err);
        return res.sendStatus(500);

    }

}

module.exports = sitePublish;