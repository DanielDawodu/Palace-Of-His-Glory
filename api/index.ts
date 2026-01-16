import type { VercelRequest, VercelResponse } from '@vercel/node';

// Cache the app instance across invocations
let app: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("🚀 Serverless Function Handler Invoked");

    // SANITY CHECK: Allow verifying the handler itself works without loading any deps
    if (req.query.ping === 'true') {
        return res.status(200).json({ status: 'pong', message: 'Handler is running' });
    }

    try {
        if (!app) {
            console.log("Lazy loading app...");
            // Dynamic import catches ALL top-level errors (DB, Syntax, Missing Modules)
            const mod = await import("../server/app.js");
            await mod.setupPromise;
            app = mod.app;
            console.log("✅ App lazy loaded successfully");
        }

        app(req, res);
    } catch (e: any) {
        console.error("🔥 Critical Server Startup Failure:", e);
        // Return 200/503 explicitly to see the JSON error in browser
        res.status(503).json({
            status: "error",
            code: "STARTUP_FAILURE",
            message: e.message,
            stack: e.stack,
            env: {
                hasDbUrl: !!process.env.DATABASE_URL,
                nodeEnv: process.env.NODE_ENV,
                cwd: process.cwd()
            }
        });
    }
}
