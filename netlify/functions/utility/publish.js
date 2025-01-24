const { WebflowClient } = require('webflow-api');
require('dotenv').config();

async function main() {
  const webflow = new WebflowClient({accessToken: process.env.WEBFLOW_TOKEN});
  
  // const sites = await webflow.sites.list();
  // console.log("sites: ", sites.sites[0].customDomains);

  try {
    const response = await webflow.sites.publish("5c3e43b5d1dbdfdc2564838b", {
      publishToWebflowSubdomain: true
    });
    console.log("Publish Response:", response);
  } catch (error) {
    console.error("Error publishing to Webflow subdomain:", error);
  }
  
}
main();