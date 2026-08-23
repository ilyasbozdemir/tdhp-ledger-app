const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => "1.0.0",
  getApiUrl: () => process.env.API_URL || "http://localhost:4000/api",
  getSocketUrl: () => process.env.SOCKET_URL || "ws://localhost:4000/socket",
});
