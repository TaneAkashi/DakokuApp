const { BrowserWindow, Notification, app, ipcMain, shell } = require('electron');
const pie = require('puppeteer-in-electron');
const puppeteer = require('puppeteer-core');
const path = require('path');
const dakoku = require('akashi-dakoku-core');
const slack = require('./slack');
const sound = require('./sound');
const store = require('./store');
const tray = require('./tray');

let browser = null;
let mainWindow = null;

const main = async () => {
  store.initialize();
  const port = store.get('port', 9999);
  await pie.initialize(app, port);
  browser = await pie.connect(app, puppeteer);
};

const openWindow = async () => {
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
  await mainWindow.loadFile('src/index.html');
  const { password, ...rest } = store.getStore();
  mainWindow.webContents.send('store-data', rest);
};

function closeWindow() {
  if (mainWindow) {
    mainWindow.close();
  }
}

const runDakoku = async (task, options) => {
  const window = new BrowserWindow({
    show: false,
  });
  const url = 'https://example.com/';
  await window.loadURL(url);
  const page = await pie.getPage(browser, window);

  const func = dakoku.dakoku(page)[task];
  return func(options);
};

const runDakokuByMenu = async (task) => {
  const slackOptions = store.getSlackOptions();

  try {
    const options = getOptions();
    const result = await runDakoku(task, options);

    if (store.get('sound', false)) {
      sound.play(task);
    }
    const notification = new Notification({
      title: result.status + (result.telework ? ` ${result.telework}` : ''),
      body: result.note ? `アラート: ${result.note}` : '',
      timeoutType: 'default',
    });
    notification.show();

    if (slackOptions.url) {
      await slack.sendSuccessMessage(slackOptions, result.status, result.note, result.telework);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : '打刻に失敗しました';

    if (store.get('sound', false)) {
      sound.play('error');
    }
    const notification = new Notification({
      title: message,
      body: '',
      timeoutType: 'default',
    });
    notification.show();

    if (slackOptions.url) {
      await slack.sendMessage(slackOptions, `:warning: ${message}`);
    }
  }
};

const getOptions = () => ({
  username: store.get('username'),
  password: store.get('password'),
  company: store.get('company'),
});

app.whenReady().then(() => {
  ipcMain.handle('dakoku', (event, task, options) => {
    return runDakoku(task, options);
  });

  ipcMain.handle('saveDakokuOptions', (event, email, password, company) => {
    store.set('username', email);
    store.set('password', password);
    store.set('company', company);
  });

  ipcMain.handle('saveSlackOptions', (event, url, icon_emoji, username) => {
    store.set('slack.url', url);
    store.set('slack.icon_emoji', icon_emoji);
    store.set('slack.username', username);
  });

  ipcMain.handle('saveOtherOptions', (event, sound, showDirectly) => {
    store.set('sound', sound);
    store.set('showDirectly', showDirectly);
    tray.initialize(openWindow, runDakokuByMenu, store.get('showDirectly'));
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

  tray.initialize(openWindow, runDakokuByMenu, store.get('showDirectly'));

  // 設定の登録がない場合はウィンドウを開く
  if (!store.get('username') || !store.get('password') || !store.get('company')) {
    openWindow();
  }
});

main();
