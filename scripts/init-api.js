const { execSync, spawn } = require("child_process");
const path = require("path");

console.log("🚀 [API Init] Starting Docker Services (PostgreSQL & RabbitMQ)...");
try {
  execSync("docker compose up -d", { stdio: "inherit", cwd: path.join(__dirname, "..") });
} catch (err) {
  console.warn("⚠️ [API Init] Docker Compose warning (PostgreSQL/RabbitMQ might already be running).");
}

console.log("⚡ [API Init] Launching Elixir Phoenix API Engine on port 4000...");
const backendPath = path.join(__dirname, "..", "apps", "backend");

const phx = spawn("mix", ["phx.server"], {
  cwd: backendPath,
  stdio: "inherit",
  shell: true,
});

phx.on("error", (err) => {
  console.error("❌ [API Init] Failed to start Elixir Phoenix server:", err);
});

phx.on("exit", (code) => {
  console.log(`ℹ️ [API Init] Phoenix process exited with code ${code}`);
});
