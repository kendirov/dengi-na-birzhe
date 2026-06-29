#!/usr/bin/env node
/**
 * Runs `next build`. Stops dev on :3000 first so build does not corrupt
 * a running dev server's CSS cache.
 */
import { spawn, execSync } from "node:child_process";

const port = process.env.PORT ?? "3000";

try {
  execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, {
    stdio: "ignore",
    shell: true,
  });
} catch {
  // no dev server — ok
}

const child = spawn("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
