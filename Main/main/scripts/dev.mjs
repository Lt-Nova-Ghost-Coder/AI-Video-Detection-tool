import net from "node:net";
import { spawn } from "node:child_process";

const FRONTEND_PORT_CANDIDATES = [8080, 5173, 3000, 4173];
const BACKEND_PORT_CANDIDATES = [8000, 8001, 8010, 9000, 9100];

function isPortFree(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen({ port, host }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function pickAvailablePort(candidates, label) {
  for (const port of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No available ${label} port found in [${candidates.join(", ")}].`);
}

function prefixStream(stream, prefix) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      process.stdout.write(`${prefix} ${line}\n`);
    }
  });
  stream.on("end", () => {
    if (buffer.length > 0) {
      process.stdout.write(`${prefix} ${buffer}\n`);
    }
  });
}

function spawnProcess(command, args, options) {
  return spawn(command, args, {
    shell: process.platform === "win32",
    stdio: ["inherit", "pipe", "pipe"],
    ...options,
  });
}

async function main() {
  const frontendPort = await pickAvailablePort(FRONTEND_PORT_CANDIDATES, "frontend");
  const backendPort = await pickAvailablePort(BACKEND_PORT_CANDIDATES, "backend");
  const backendUrl = `http://127.0.0.1:${backendPort}`;

  console.log(`[dev] Frontend: http://localhost:${frontendPort}`);
  console.log(`[dev] Backend:  ${backendUrl}`);

  const backend = spawnProcess(
    "python",
    [
      "-m",
      "uvicorn",
      "app:app",
      "--host",
      "127.0.0.1",
      "--port",
      String(backendPort),
      "--reload",
      "--app-dir",
      "backend",
    ],
    { cwd: process.cwd(), env: { ...process.env } }
  );

  const frontend = spawnProcess(
    "npx",
    ["vite", "--host", "::", "--port", String(frontendPort), "--strictPort"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        VITE_API_BASE_URL: backendUrl,
      },
    }
  );

  prefixStream(backend.stdout, "[BACKEND]");
  prefixStream(backend.stderr, "[BACKEND]");
  prefixStream(frontend.stdout, "[FRONTEND]");
  prefixStream(frontend.stderr, "[FRONTEND]");

  let shuttingDown = false;
  const shutdown = (reason) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[dev] Shutting down (${reason})...`);
    if (!frontend.killed) frontend.kill("SIGTERM");
    if (!backend.killed) backend.kill("SIGTERM");
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  backend.on("exit", (code, signal) => {
    shutdown(`backend exited (code=${code ?? "null"}, signal=${signal ?? "null"})`);
  });

  frontend.on("exit", (code, signal) => {
    shutdown(`frontend exited (code=${code ?? "null"}, signal=${signal ?? "null"})`);
  });
}

main().catch((error) => {
  console.error(`[dev] Failed to start dev environment: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
