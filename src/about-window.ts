import path from 'path';
import { app, BrowserWindow } from 'electron';

let win: BrowserWindow | null = null;

export const open = async (): Promise<void> => {
  if (win) {
    win.show();
    win.focus();
    return;
  }

  win = new BrowserWindow({
    width: 360,
    height: 240,
    webPreferences: {
      preload: path.join(__dirname, 'preload-about.js'),
    },
  });
  await win.loadFile('templates/about.html');
  win.webContents.send('version', app.getVersion());
  win.on('closed', () => {
    win = null;
  });
};
