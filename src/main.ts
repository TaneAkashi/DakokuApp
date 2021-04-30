import path from 'path';
import { BrowserWindow, Notification, app, ipcMain, shell } from 'electron';
import * as browser from './browser';
import * as dakoku from './dakoku';
import * as store from './store';
import * as tray from './tray';

let mainWindow: BrowserWindow | null = null;

const initialize = async () => {
  store.initialize();
  const port = store.getPort();
  await browser.initialize(app, port);
};
const initializePromise = initialize();

const openWindow = async () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
  await mainWindow.loadFile('templates/index.html');
  mainWindow.webContents.send('store-data', store.getInitialOptions());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

function closeWindow() {
  if (mainWindow) {
    mainWindow.close();
  }
}

app.whenReady().then(async () => {
  ipcMain.handle('dakoku', (event, task, options) => {
    return dakoku.run(task, options);
  });

  ipcMain.handle('saveDakokuOptions', (event, email, password, company) => {
    store.saveDakokuOptions(email, password, company);
  });

  ipcMain.handle('saveSlackOptions', (event, url, icon_emoji, username) => {
    store.saveSlackOptions(url, icon_emoji, username);
  });

  ipcMain.handle('saveOtherOptions', (event, sound, showDirectly) => {
    store.saveOtherOptions(sound, showDirectly);
    tray.initialize(openWindow, dakoku.runByMenu, store.getShowDirectly());
  });

  ipcMain.handle('closeWindow', () => {
    closeWindow();
  });

  // これがないとなぜかSlack通知失敗する
  new BrowserWindow({
    show: false,
  });

  // 権限求める用
  const notification = new Notification();
  notification.close();

  // 初期化処理待機
  await initializePromise;

  tray.initialize(openWindow, dakoku.runByMenu, store.getShowDirectly());

  // 設定の登録がない場合はウィンドウを開く
  const dakokuOptions = store.getDakokuOptions();
  if (!dakokuOptions.username || !dakokuOptions.password || !dakokuOptions.company) {
    openWindow();
  }
});
