const { spawn, execSync } = require("child_process");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const backendDir = path.join(rootDir, "apps", "backend");
const webDir = path.join(rootDir, "apps", "web");

console.log("\n=======================================================");
console.log("🚀 TDHP Ledger System - Full Stack Dev Launcher");
console.log("=======================================================\n");

// 1. Ensure Docker containers are up
try {
  console.log("📦 Starting PostgreSQL & RabbitMQ via Docker Compose...");
  execSync("docker compose up -d", { stdio: "ignore", cwd: rootDir });
  console.log("✅ Docker services ready! (PostgreSQL :5433 | RabbitMQ :15672)");
} catch (e) {
  console.warn("⚠️ Docker check skipped or containers already running.");
}

console.log("⚡ Starting Elixir Phoenix Backend (http://localhost:4000)...");
const backendProcess = spawn("mix", ["phx.server"], {
  cwd: backendDir,
  shell: true,
  stdio: "pipe",
});

console.log("🌐 Starting Next.js Web App (http://localhost:3000)...");
const webProcess = spawn("pnpm", ["--filter", "web", "dev"], {
  cwd: rootDir,
  shell: true,
  stdio: "pipe",
});

// Helper for prefixing log streams
function pipeOutput(stream, prefix, colorCode) {
  stream.on("data", (chunk) => {
    const lines = chunk.toString().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`\x1b[${colorCode}m[${prefix}]\x1b[0m ${line}`);
      }
    });
  });
}

pipeOutput(backendProcess.stdout, "BEAM Engine", "35"); // Magenta
pipeOutput(backendProcess.stderr, "BEAM Engine", "31"); // Red
pipeOutput(webProcess.stdout, "Next.js Web", "36");     // Cyan
pipeOutput(webProcess.stderr, "Next.js Web", "33");     // Yellow

function cleanup() {
  console.log("\n🛑 Stopping all dev processes...");
  backendProcess.kill("SIGTERM");
  webProcess.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
