import path from 'path';
import * as dakoku from 'akashi-dakoku-core';
import { BrowserWindow, Notification, app, ipcMain, shell } from 'electron';
import pie from 'puppeteer-in-electron';
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-core';
import { Block, KnownBlock } from '@slack/types';
import * as slack from './slack';
import * as sound from './sound';
import * as store from './store';
import * as tray from './tray';

export type TaskType = keyof ReturnType<typeof dakoku.dakoku>;

type DakokuOptions = {
  username: string;
  password: string;
  company: string;
};

let browser: Browser | null = null;
let mainWindow: BrowserWindow | null = null;

const main = async () => {
  store.initialize();
  const port = store.getPort();
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
  await mainWindow.loadFile('templates/index.html');
  mainWindow.webContents.send('store-data', store.getInitialOptions());
};

function closeWindow() {
  if (mainWindow) {
    mainWindow.close();
  }
}

const runDakoku = async (task: TaskType, options: DakokuOptions): Promise<dakoku.Result> => {
  if (!browser) {
    throw new Error('browser is not initialized.');
  }
  const window = new BrowserWindow({
    show: false,
  });
  const url = 'https://example.com/';
  await window.loadURL(url);
  const page = await pie.getPage(browser, window);

  const func = dakoku.dakoku(page)[task];
  return func(options);
};

const runDakokuByMenu = async (task: TaskType): Promise<void> => {
  const dakokuOptions = store.getDakokuOptions();
  const slackOptions = store.getSlackOptions();

  type Payload = {
    success: boolean;
    soundType: TaskType | 'error';
    notification: {
      title: string;
      body: string;
    };
    slack: {
      text: string;
      blocks?: (Block | KnownBlock)[];
    };
  };

  const payload: Payload = await runDakoku(task, dakokuOptions)
    .then((result) => {
      return {
        success: true,
        soundType: task,
        notification: {
          title: result.status + (result.telework ? ` ${result.telework}` : ''),
          body: result.note ? `アラート: ${result.note}` : '',
        },
        slack: slack.generateSuccessMessage(result.status, result.note, result.telework),
      };
    })
    .catch((e) => {
      const message = e instanceof Error ? e.message : '打刻に失敗しました';
      return {
        success: false,
        soundType: 'error',
        notification: {
          title: message,
          body: '',
        },
        slack: {
          text: `:warning: ${message}`,
        },
      };
    });

  if (store.getSound()) {
    sound.play(payload.soundType);
  }

  const notification = new Notification({
    ...payload.notification,
    timeoutType: 'default',
  });
  notification.show();

  if (slackOptions.url) {
    await slack.sendMessage(slackOptions, payload.slack.text, payload.slack.blocks);
  }
};

app.whenReady().then(() => {
  ipcMain.handle('dakoku', (event, task, options) => {
    return runDakoku(task, options);
  });

  ipcMain.handle('saveDakokuOptions', (event, email, password, company) => {
    store.saveDakokuOptions(email, password, company);
  });

  ipcMain.handle('saveSlackOptions', (event, url, icon_emoji, username) => {
    store.saveSlackOptions(url, icon_emoji, username);
  });

  ipcMain.handle('saveOtherOptions', (event, sound, showDirectly) => {
    store.saveOtherOptions(sound, showDirectly);
    tray.initialize(openWindow, runDakokuByMenu, store.getShowDirectly());
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

  tray.initialize(openWindow, runDakokuByMenu, store.getShowDirectly());

  // 設定の登録がない場合はウィンドウを開く
  const dakokuOptions = store.getDakokuOptions();
  if (!dakokuOptions.username || !dakokuOptions.password || !dakokuOptions.company) {
    openWindow();
  }
});

main();
