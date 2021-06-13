import { ipcMain } from 'electron';
import * as dakoku from './dakoku';
import * as slack from './slack';
import * as settingsWindow from './settings-window';
import * as store from './store';
import * as tray from './tray';
import * as release from './release';

export const subscribe = (): void => {
  ipcMain.handle(
    'saveDakokuOptions',
    async (event, email, password, company): Promise<{ success: boolean; message: string }> => {
      const result = await dakoku.checkLogin({ username: email, password, company }).catch((e: Error) => e);

      if (result instanceof Error) {
        return { success: false, message: result.message };
      }
      if (!result) {
        return { success: false, message: 'ログインできませんでした' };
      }

      store.saveDakokuOptions(email, password, company);
      return { success: true, message: '保存しました' };
    }
  );

  ipcMain.handle(
    'saveSlackOptions',
    async (event, url, icon_emoji, username): Promise<{ success: boolean; message: string }> => {
      const result = slack
        .sendMessage({ url, icon_emoji, username }, '投稿テスト')
        .then(() => {
          return { success: true, message: '保存しました' };
        })
        .catch(() => {
          return { success: false, message: '投稿に失敗しました' };
        });
      store.saveSlackOptions(url, icon_emoji, username);
      return result;
    }
  );

  ipcMain.handle('saveOtherOptions', (event, sound, showDirectly) => {
    store.saveOtherOptions(sound, showDirectly);
    tray.initialize(settingsWindow.open, dakoku.runByMenu, store.getShowDirectly(), release.getLatest());
  });
};
