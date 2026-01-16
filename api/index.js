import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default async function handler(req, res) {
    console.log("🚀 Serverless Function Handler Invoked (JS)");

    // SANITY CHECK: Allow verifying the handler itself works without loading any deps
    if (req.query && req.query.ping === 'true') {
        return res.status(200).json({ status: 'pong', message: 'Handler is running (JS/ESM)' });
    }

    try {
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
