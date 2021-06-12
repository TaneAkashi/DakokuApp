import { BrowserWindow, Notification, app } from 'electron';
import * as dakoku from './dakoku';
import * as ipc from './ipc';
import * as pptr from './pptr';
import * as settingsWindow from './settings-window';
import * as store from './store';
import * as tray from './tray';
import * as release from './release';

const initialize = async () => {
  await store.initialize();
  const port = store.getPort();
  await pptr.initialize(app, port);
};
const initializePromise = initialize();

app.whenReady().then(async () => {
  // ipcMain.handle 登録
  ipc.subscribe();

  // これがないとなぜかSlack通知失敗する
  new BrowserWindow({
    show: false,
  });

  // 権限求める用
  const notification = new Notification();
  notification.close();

  // 初期化処理待機
  await initializePromise;

  // Tray 表示
  tray.initialize(settingsWindow.open, dakoku.runByMenu, store.getShowDirectly());

  // 設定の登録がない場合はウィンドウを開く
  const dakokuOptions = store.getDakokuOptions();
  if (!dakokuOptions.username || !dakokuOptions.password || !dakokuOptions.company) {
    settingsWindow.open();
  }

  // 起動時に更新がないか調べる
  await release.doIfNotLatest();
});
