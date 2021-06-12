import { ipcMain } from 'electron';
import * as dakoku from './dakoku';
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

  ipcMain.handle('saveSlackOptions', (event, url, icon_emoji, username) => {
    store.saveSlackOptions(url, icon_emoji, username);
  });

  ipcMain.handle('saveOtherOptions', (event, sound, showDirectly) => {
    store.saveOtherOptions(sound, showDirectly);
    tray.initialize(settingsWindow.open, dakoku.runByMenu, store.getShowDirectly(), release.getLatest());
  });
};
