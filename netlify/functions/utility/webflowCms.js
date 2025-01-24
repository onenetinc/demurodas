const fs = require('fs');

const { WebflowClient } = require('webflow-api');

const webflow = new WebflowClient({accessToken: process.env.WEBFLOW_TOKEN});

const siteId = '5c3e43b5d1dbdfdc2564838b';

const collectionId = '5c64ac7c6c778da51cf9294c';

const sites = webflow.sites.list();

sites.then(s => console.log(s));

const collections = webflow.collections({ siteId: siteId });

collections.then(c => console.log(c));

const collection = webflow.collection({ collectionId: collectionId });
collection.then(c => fs.writeFileSync('schema-new.json', JSON.stringify(c, null, 4)));

const items = webflow.items({ collectionId: collectionId }, { limit: 100 });
items.then(i => fs.writeFileSync('items.json', JSON.stringify(i, null, 4)));

