const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

exports.handler = async () => {
  console.log("🚀 Connecting to Browserless...");
  const BROWSERLESS_API_KEY = "RjRbvDDTnIm2vN2d0126163c4ba7de95be0a42f050";
  const browserWSEndpoint = `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`;

  let browser;
  try {
    console.log("🔄 Attempting to connect to Browserless...");
    browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: { width: 1280, height: 800 }, // Simulating a real user
    });

    console.log("✅ Connected to Browserless!");

    console.log("🌐 Creating a new page...");
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("✅ Successfully created a new page.");

    // **💡 Test URL**
    const productSlug = "athena-side-table"; // Change slug dynamically later
    const testURL = `https://demurodas.webflow.io/products/${productSlug}?mode=server`;

    console.log(`🌍 Navigating to ${testURL}...`);

    await page.goto(testURL, {
      waitUntil: "networkidle2", // More aggressive waiting
      timeout: 25000, // 25s timeout
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
