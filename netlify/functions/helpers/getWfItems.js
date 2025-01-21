// const Webflow = require('webflow-api');
const { WebflowClient } = require('webflow-api');
// import Webflow from 'webflow-api';
// const webflow = new WebflowClient({ accessToken: 'acfa51cf1555df256a0006988aa891ad0ff797c091bd08505fcf03d53db44c08' });
const webflow = new WebflowClient({accessToken: 'bba5439f0f7463ca6c37c7f30d1d302cda2f7a5ee29731fb39e701fef0bc3cdc'});
const collectionId = '624b54916b21e6aa15e8fe92';

const getWfItems = () => {

    return new Promise(async (resolve, reject) => {

        try {

            let allItems = [];
            let count = 0;

            const getData = (offset) => {

                return new Promise(async (resolve, reject) => {

                    try {

                        // const data = await webflow.items({ collectionId: collectionId }, { limit: 100, offset: offset });
                        const data = await webflow.collections.items.listItemsLive(collectionId, { limit: 100, offset: offset });

                        count += data.count;

                        data.items.forEach(item => {

                            if (!item._draft && !item._archived) {

                                allItems.push(item);

                            }

                        });

                        if (data.count === 100) {

                            getData(count);

                        } else {

                            resolve(allItems);

                        }

                    } catch (err) {

                        reject(err);

                    }

                });

            }

            const result = await getData(0);

            resolve(result);

        } catch (err) {

            reject(err);

        }

    });
}

module.exports = getWfItems;