module.exports = async (req, res) => {
  try {
    console.log("🔍 Attempting to load _bundle.js...");
    const bundle = require('./_bundle.js');
    console.log("✅ Bundle loaded successfully.");
    
    const app = bundle.app || bundle.default || bundle;
    const setupPromise = bundle.setupPromise;
    
    res.status(200).json({
      status: "online",
      bundle: "loaded",
      hasApp: typeof app === 'function',
      hasSetup: typeof setupPromise !== 'undefined',
      exports: Object.keys(bundle)
    });
  } catch (err) {
    console.error("❌ Bundle Load Error:", err.message);
    res.status(500).json({
      status: "crashed",
      error: err.message,
      stack: err.stack,
      node: process.version
    });
  }
};
