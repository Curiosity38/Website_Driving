import { spawn } from "node:child_process";
import { rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "app", "api");
const disabledApiDir = path.join(root, "app", "_api_disabled");

let apiMoved = false;

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function moveApiOutOfExport() {
  await rm(disabledApiDir, { recursive: true, force: true });
  if (await exists(apiDir)) {
    await rename(apiDir, disabledApiDir);
    apiMoved = true;
  }
}

async function restoreApi() {
  if (apiMoved) {
    await rm(apiDir, { recursive: true, force: true });
    await rename(disabledApiDir, apiDir);
  }
}

function runNextBuild() {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const child = spawn(command, ["next", "build"], {
    cwd: root,
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_STATIC_SITE: "true"
    },
    stdio: "inherit"
  });

  return new Promise((resolve) => {
    child.on("close", (code) => resolve(code ?? 1));
  });
}

try {
  await moveApiOutOfExport();
  const code = await runNextBuild();
  await restoreApi();
  process.exit(code);
} catch (error) {
  await restoreApi();
  console.error(error);
  process.exit(1);
}
