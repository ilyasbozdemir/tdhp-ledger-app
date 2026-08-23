const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "TDHP Ledger System - Kasiyer & Muhasebe Masaüstü Uygulaması",
    backgroundColor: "#0B0F17",
    icon: path.join(__dirname, "assets/icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const serverUrl = process.env.WEB_URL || "http://localhost:3000";
  const apiUrl = process.env.API_URL || "http://localhost:4000/api";

  console.log(`[Electron Main] Connecting to Next.js UI at ${serverUrl}`);
  console.log(`[Electron Main] Phoenix API Engine target at ${apiUrl}`);

  // Load Next.js web application
  mainWindow.loadURL(serverUrl).catch((err) => {
    console.error("[Electron Main] Failed to load server URL, showing fallback HTML", err);
    mainWindow.loadURL(`data:text/html,
      <html style="background:#0B0F17;color:white;font-family:sans-serif;padding:40px;">
        <h2>TDHP Ledger Masaüstü Uygulaması</h2>
        <p>Next.js sunucusuna bağlanılamadı (${serverUrl}). Lütfen önce <code>pnpm dev:web</code> komutunu çalıştırın.</p>
        <p>Elixir API Engine URL: <code>${apiUrl}</code></p>
      </html>
    `);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
