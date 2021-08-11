import { BrowserWindow, Notification, app } from 'electron';
import * as dakoku from './dakoku';
import * as ipc from './ipc';
import * as pptr from './pptr';
import * as settingsWindow from './settings-window';
import * as store from './store';
import * as tray from './tray';
import * as release from './release';
import * as log from './log';

/**
 * electron の初期化に依存しない機能の初期化処理
 * pptr.initialize 関数はelectronの初期化処理が完了する前（= app.isReady が false の間） に呼ばれる必要がある
 */
const initialize = async () => {
  await pptr.initialize(app);
  await store.initialize();
  log.initialize();
};
const initializePromise = initialize();

app.whenReady().then(async () => {
  log.info('electron is ready.');

  // ipcMain.handle 登録
  ipc.subscribe();

  // これがないとなぜかSlack通知失敗する
  new BrowserWindow({
    show: false,
  });

  // 権限求める用
  const notification = new Notification();
  notification.close();

  // 初期化処理完了待機
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
