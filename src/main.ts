import { BrowserWindow, Notification, app, ipcMain } from 'electron';
import * as dakoku from './dakoku';
import * as pptr from './pptr';
import * as settingsWindow from './settings-window';
import * as store from './store';
import * as tray from './tray';

const initialize = async () => {
  store.initialize();
  const port = store.getPort();
  await pptr.initialize(app, port);
};
const initializePromise = initialize();

app.whenReady().then(async () => {
  ipcMain.handle(
    'saveDakokuOptions',
    async (event, email, password, company): Promise<{ success: boolean; message: string }> => {
      if (dakokuWindow) {
        return { success: false, message: '別の処理が実行されています' };
      }

      dakokuWindow = new BrowserWindow({
        show: false,
      });
      const page = await pptr.getPage(dakokuWindow);
      const result = await dakoku.checkLogin(page)({ username: email, password, company });

      if (dakokuWindow) {
        dakokuWindow.destroy();
        dakokuWindow = null;
      }

      if (!result) {
        return { success: false, message: 'ログインできませんでした' };
      }

      store.saveDakokuOptions(email, password, company);
      return { success: true, message: '保存しました' };
    }
  );

  ipcMain.handle('saveSlackOptions', (event, url, icon_emoji, username) => {
    store.saveSlackOptions(url, icon_emoji, username);
  });

  ipcMain.handle('saveOtherOptions', (event, sound, showDirectly) => {
    store.saveOtherOptions(sound, showDirectly);
    tray.initialize(settingsWindow.open, dakoku.runByMenu, store.getShowDirectly());
  });

  ipcMain.handle('closeWindow', () => {
    settingsWindow.close();
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

  tray.initialize(settingsWindow.open, dakoku.runByMenu, store.getShowDirectly());

  // 設定の登録がない場合はウィンドウを開く
  const dakokuOptions = store.getDakokuOptions();
  if (!dakokuOptions.username || !dakokuOptions.password || !dakokuOptions.company) {
    settingsWindow.open();
  }
});
