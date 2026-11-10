import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Spawn Vite
console.log("Starting Vite Frontend...");
const vite = spawn("npx", ["vite"], {
  stdio: "inherit",
  shell: true
});

// Spawn Backend Server
console.log("Starting Python Backend Server...");
const pythonExecutable = path.join(__dirname, "..", ".venv", "Scripts", "python.exe");
const backendDir = path.join(__dirname, "..", "backend");

const backend = spawn(pythonExecutable, ["server.py"], {
  cwd: backendDir,
  stdio: "inherit",
  shell: true
});

// Handle termination cleanly
const killAll = () => {
  try { vite.kill(); } catch (e) {}
  try { backend.kill(); } catch (e) {}
};

process.on("exit", killAll);
process.on("SIGINT", () => {
  killAll();
  process.exit();
});
process.on("SIGTERM", () => {
  killAll();
  process.exit();
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception in start orchestrator:", err);
  killAll();
  process.exit(1);
});
