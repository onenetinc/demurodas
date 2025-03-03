const { chromium } = require("playwright");

exports.handler = async () => {
  console.log("🚀 Connecting to Browserless...");
  const BROWSERLESS_API_KEY = "RjRbvDDTnIm2vN2d0126163c4ba7de95be0a42f050";
  const browserURL = `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}&--keep-alive=true`;

  try {
    console.log("🔄 Attempting to connect to Browserless...");
    const browser = await chromium.connectOverCDP(browserURL);
    console.log("✅ Connected to Browserless!");
    await browser.close();
    return { statusCode: 200, body: "Test function completed successfully!" };
  } catch (error) {
    console.error("❌ ERROR: Failed to connect to Browserless:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to connect to Browserless", error: error.message }),
    };
  }
};
