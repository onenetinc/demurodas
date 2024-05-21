const fs = require('fs');

const Webflow = require('webflow-api');

const webflow = new Webflow({ token: 'acfa51cf1555df256a0006988aa891ad0ff797c091bd08505fcf03d53db44c08' });

const siteId = '5c3e43b5d1dbdfdc2564838b';

const collectionId = '5c64ac7c6c778da51cf9294c';

const sites = webflow.sites();

sites.then(s => console.log(s));

const collections = webflow.collections({ siteId: siteId });

collections.then(c => console.log(c));

const collection = webflow.collection({ collectionId: collectionId });
collection.then(c => fs.writeFileSync('schema-new.json', JSON.stringify(c, null, 4)));

const items = webflow.items({ collectionId: collectionId }, { limit: 100 });
items.then(i => fs.writeFileSync('items.json', JSON.stringify(i, null, 4)));

