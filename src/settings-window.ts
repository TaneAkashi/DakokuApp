import path from 'path';
import { BrowserWindow, shell } from 'electron';
import * as store from './store';

let mainWindow: BrowserWindow | null = null;

export const open = async (): Promise<void> => {
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

export const close = (): void => {
  if (mainWindow) {
    mainWindow.close();
  }
};
