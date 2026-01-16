import type { VercelRequest, VercelResponse } from '@vercel/node';

import { app, setupPromise } from "../server/app.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("🚀 Serverless Function Handler Invoked");
    try {
        await setupPromise;
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
