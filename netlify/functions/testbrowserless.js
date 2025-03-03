const { chromium } = require("playwright");

exports.handler = async () => {
  console.log("🚀 Connecting to Browserless...");
  const BROWSERLESS_API_KEY = "RjRbvDDTnIm2vN2d0126163c4ba7de95be0a42f050";
  const browserURL = `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}&--keep-alive=true`;

  try {
    console.log("🔄 Attempting to connect to Browserless...");
    const browser = await chromium.connectOverCDP(browserURL);
    console.log("✅ Connected to Browserless!");

    console.log("🌐 Creating a new page...");
    const context = await browser.newContext({
      extraHTTPHeaders: {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const page = await context.newPage();
    console.log("✅ Successfully created a new page.");

    // **💡 Test URL**
    const productSlug = "athena-side-table"; // Change slug dynamically later
    const testURL = `https://demurodas.webflow.io/products/${productSlug}?mode=server`;

    console.log(`🌍 Navigating to ${testURL}...`);

    await page.goto(testURL, {
      waitUntil: "load", // ✅ Ensures full page render
      timeout: 20000, // ⏳ Increase timeout for slow pages
    });

    console.log("✅ Page loaded successfully.");

    await browser.close();
    return { statusCode: 200, body: "Navigation test completed successfully!" };
  } catch (error) {
    console.error("❌ ERROR: Failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error occurred", error: error.message }),
    };
  }
};
