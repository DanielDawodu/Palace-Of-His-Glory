import type { VercelRequest, VercelResponse } from '@vercel/node';

import { app, setupPromise } from "../server/app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("🚀 Serverless Function Handler Invoked");
    try {
        await setupPromise;
        app(req, res);
    } catch (e: any) {
        console.error("🔥 Critical Server Failure:", e);
        res.status(500).json({
            error: "Server Startup Failed",
            message: e.message,
            stack: e.stack,
            env: {
                hasDbUrl: !!process.env.DATABASE_URL
            }
        });
    }
}
