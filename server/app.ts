import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { createServer } from "http";

export const app = express();
export const httpServer = createServer(app);

declare module "http" {
    interface IncomingMessage {
        rawBody: unknown;
    }
}

app.use(
    express.json({
        verify: (req, _res, buf) => {
            req.rawBody = buf;
        },
    }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            log(logLine);
        }
    });

    next();
});

// We return the promise so the caller can wait for routes to be registered
export const setupPromise = registerRoutes(httpServer, app);

// Error handling - Should happen after setupPromise resolves, but we can attach it here 
// Note: In Express, error handlers must be attached LAST. 
// Since registerRoutes is async, it might attach middleware. 
// However, registerRoutes only ATTACHES routes. The "routes" are middleware.
// If we attach error handler here, it might come BEFORE the routes in the stack if registerRoutes awaits something before attaching.
// Looking at registerRoutes: it awaits seedDatabase() AT THE END. All routes are attached synchronously before that.
// So we can attach error handler here.
setupPromise.then(() => {
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        // We don't throw here in production because it crashes the process, but in dev it might be useful?
        // server/index.ts had `throw err`.
        // If we throw, the process crashes.
        // Let's keep the logging but maybe not throw?
        console.error(err);
    });
});
