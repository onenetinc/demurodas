const Webflow = require('webflow-api');


const webflow = new Webflow({ token: 'acfa51cf1555df256a0006988aa891ad0ff797c091bd08505fcf03d53db44c08' });

// Promise <{ queued: Boolean }>
const published = webflow.publishSite({ siteId: '5c3e43b5d1dbdfdc2564838b', domains: ['demurodas.webflow.io'] });

published.then(p => console.log(p));