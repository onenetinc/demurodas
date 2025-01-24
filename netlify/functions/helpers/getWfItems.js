// const Webflow = require('webflow-api');
const { WebflowClient } = require('webflow-api');
// const webflow = new WebflowClient({ accessToken: 'acfa51cf1555df256a0006988aa891ad0ff797c091bd08505fcf03d53db44c08' }); // old token and sdk syntax
const webflow = new WebflowClient({accessToken: process.env.WEBFLOW_TOKEN});
const collectionId = process.env.WEBFLOW_PRODUCTS_ID;

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