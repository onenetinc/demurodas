const { db } = require('./helpers/firebase');
const getWfItems = require('./helpers/getWfItems');
const createNewMapping = require('./helpers/createNewMapping');
const publishMessage = require('./helpers/publishMessage');

const sitePublish = async (req, res) => {
  try {
    console.log(`Webflow site was published, regenerating the cmsMapping...`);

    // Fetch the current CMS items from Webflow
    const currentCmsItems = await getWfItems();

    console.log("currentCmsItems: ", currentCmsItems[0])
    console.log("currentCmsItems.length: ", currentCmsItems.length)

    // Create a new mapping from the CMS items
    const updatedMapping = createNewMapping(currentCmsItems);

    // Ensure there are no missing or undefined fields
    Object.keys(updatedMapping).forEach(id => {
      if (!updatedMapping[id].slug) {
        console.error(`Skipping item with ID ${id} due to missing slug`);
        delete updatedMapping[id];
      }
    });

    // Rebuild cmsMapping from scratch in Firestore
    await db.collection('cmsMapping').doc('items').set(updatedMapping);

    console.log(`Rebuilt cmsMapping with ${Object.keys(updatedMapping).length} items`);

    // Optionally, process each item (if needed)
    let toProcess = [];
    Object.keys(updatedMapping).forEach(id => {
      const item = updatedMapping[id];
      toProcess.push(publishMessage('processCmsItem', { id, imgUrl: item.imgUrl }));
      toProcess.push(publishMessage('generateProductPdfs', { slug: item.slug }));
    });

    if (toProcess.length > 0) {
      await Promise.all(toProcess);
      console.log(`Sent all messages for processing ${toProcess.length} items`);
    }

    return res.status(200).send('CMS mapping regenerated successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
};

exports.handler = async (event, context) => {
  const req = {
    query: event.queryStringParameters,
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
    path: event.path
  };

  const res = {
    status: (code) => ({
      json: (data) => ({
        statusCode: code,
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }),
      send: (message) => ({
        statusCode: code,
        body: message,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
    })
  };

  return await sitePublish(req, res);
};