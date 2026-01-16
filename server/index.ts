// import "dotenv/config";
import { app, httpServer, setupPromise, log } from "./app";

import { serveStatic } from "./static";

// Export app for Verce/Serverless usage
export { app, setupPromise } from "./app";

// Helper to check if we are the main module (work with CJS bundle)
const isMainModule = (import.meta.url === `file://${process.argv[1]}`) || (typeof require !== 'undefined' && require.main === module);



(async () => {
  // Only start server if running directly (npm start / dev)
  // OR if we are not in a serverless environment (optional check)
  if (!process.env.VERCEL && isMainModule) {
    await setupPromise;

    if (process.env.NODE_ENV !== "production") {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    } else {
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || "3000", 10);
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  }
})();
