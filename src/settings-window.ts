import path from 'path';
import { BrowserWindow, shell } from 'electron';
import * as store from './store';

let win: BrowserWindow | null = null;

export const open = async (): Promise<void> => {
  if (win) {
    win.show();
    win.focus();
    return;
  }

  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
  await win.loadFile('templates/index.html');
  win.webContents.send('store-data', store.getInitialOptions());
  win.on('closed', () => {
    win = null;
  });
};

export const close = (): void => {
  if (win) {
    win.close();
  }
};
