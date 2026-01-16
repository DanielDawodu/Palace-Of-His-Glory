export default async function handler(req, res) {
    console.log("🚀 Serverless Function Handler Invoked (JS)");

    // SANITY CHECK: Allow verifying the handler itself works without loading any deps
    if (req.query.ping === 'true') {
        return res.status(200).json({ status: 'pong', message: 'Handler is running (JS)' });
    }

    try {
        // Lazy load the app
        console.log("Lazy loading app...");
        // Use relative path to built server files or source if using ts-node
        // Since Vercel might not build server/app.ts to .js automatically if we don't tell it to.
        // But typically with "type":"module", we import .ts files via their .js extension if using tsx/ts-node.
        // However, in production Vercel, we need to be careful.

        // We will try to import the transpiled version if possible, or source.
        // Given the project setup, we are relying on Vercel's build step.
        // Let's assume Vercel handles the TS files in 'server'.

        const mod = await import("../server/app.ts");
        // NOTE: Importing .ts directly usually requires a loader. 
        // If this fails, we might need to rely on the build output.
        // But let's try the dynamic import of the .ts source first as Vercel usually supports it.

        await mod.setupPromise;
        const app = mod.app;
        console.log("✅ App lazy loaded successfully");

        app(req, res);
    } catch (e) {
        console.error("🔥 Critical Server Startup Failure:", e);
        res.status(503).json({
            status: "error",
            code: "STARTUP_FAILURE",
            message: e.message,
            stack: e.stack,
            env: {
                nodeEnv: process.env.NODE_ENV,
                cwd: process.cwd()
            }
        });
    }
}
