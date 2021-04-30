import { ipcMain } from 'electron';
import * as dakoku from './dakoku';
import * as settingsWindow from './settings-window';
import * as store from './store';
import * as tray from './tray';

export const subscribe = (): void => {
  ipcMain.handle('saveDakokuOptions', (event, email, password, company) => {
    store.saveDakokuOptions(email, password, company);
  });

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
};
