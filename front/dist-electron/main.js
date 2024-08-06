"use strict";
const {
  app,
  BrowserWindow,
  BrowserView,
  BaseWindow,
  WebContentsView,
  Notification,
  ipcMain
} = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const NODE_ENV = process.env.NODE_ENV;
const isDev = NODE_ENV === "development";
function createNotification(title, body) {
  new Notification({ title, body }).show();
}
const createWindow = () => {
  const win = new BrowserWindow({
    // 单个窗口
    // const win = new BaseWindow({ // 多个窗口
    width: 1e3,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      // 解决无法使用 require 加载的 bug
      // 引入预加载脚本
      preload: path.join(__dirname, "preload.js")
    }
  });
  if (isDev) {
    win.loadURL("http://localhost:8881/#/upload");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  ipcMain.on("show-notification", (event, title, body) => {
    createNotification(title, body);
  });
};
app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdates();
  new Notification({
    title: "测试",
    body: "测试开始"
  }).show();
});
autoUpdater.on("update-available", (_info) => {
  console.log("有新版本");
  dialog.showMessageBox({
    type: "warning",
    title: "更新提示",
    message: "有新版本发布了",
    buttons: ["更新", "取消"],
    cancelId: 1
  }).then((res) => {
    if (res.response == 0) {
      autoUpdater.downloadUpdate();
    }
  });
});
app.on("window-all-closed", () => {
  new Notification({
    title: "测试",
    body: "测试"
  }).show();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
