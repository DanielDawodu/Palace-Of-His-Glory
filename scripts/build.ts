import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  console.log("building vercel bundle...");
  await esbuild({
    entryPoints: ["server/app.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "api/_bundle.js", // Back to .js, but with api/package.json CommonJS override
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: false,
    external: externals,
    logLevel: "info",
  });

  // Create a clean, non-minified entry point that requires the bundle
  // This avoids reference errors with minified variables like 'app'
  const entryPointContent = `
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
  `;
  
  const fs = await import("fs/promises");
  await fs.writeFile("api/index.js", entryPointContent.trim());
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
