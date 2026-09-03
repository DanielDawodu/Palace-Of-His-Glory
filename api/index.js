const bundle = require('./_bundle.js');

module.exports = async (req, res) => {
  const app = bundle.app || bundle.default || bundle;
  const setupPromise = bundle.setupPromise;

  if (setupPromise) {
    try {
      // In serverless, we must ensure DB is connected before handling requests
      await setupPromise;
    } catch (err) {
      console.error("❌ Vercel Initialization Error:", err.message);
      // We don't return 500 here yet, let the app try to handle it or show diagnostics
    }
  }

  if (typeof app !== 'function') {
    console.error("❌ Vercel Handler Error: 'app' is not a function", typeof app);
    return res.status(500).json({ error: "Server initialization failed: app not found" });
  }

  return app(req, res);
};