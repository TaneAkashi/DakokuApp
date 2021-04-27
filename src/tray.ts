import path from 'path';
import { Menu, MenuItemConstructorOptions, MenuItem, Tray, app, shell } from 'electron';
import { TaskType } from './main';
import * as release from './release';

let tray: Tray | null = null;

const getIcon = (): string => {
  return process.env.NODE_ENV !== 'development'
    ? path.join(process.resourcesPath, 'img/TrayIconTemplate.png')
    : 'img/TrayIconTemplate.png';
};
const icon = getIcon();

const generateMenu = (
  open: () => void,
  run: (task: TaskType) => Promise<void>,
  showDirectly: boolean,
  _release: release.Release | null
): (MenuItemConstructorOptions | MenuItem)[] => {
  const menu: (MenuItemConstructorOptions | MenuItem)[] = [];

  menu.push(
    {
      type: 'normal',
      label: '出勤打刻',
      click: () => {
        run('startWork');
      },
    },
    {
      type: 'normal',
      label: '出勤打刻・テレワーク開始',
      click: () => {
        run('startTelework');
      },
    },
    {
      type: 'normal',
      label: '退勤打刻',
      click: () => {
        run('finishWork');
      },
    },
    {
      type: 'separator',
    }
  );

  if (showDirectly) {
    menu.push(
      {
        type: 'normal',
        label: '直行打刻',
        click: () => {
          run('startWorkDirectly');
        },
      },
      {
        type: 'normal',
        label: '直帰打刻',
        click: () => {
          run('finishWorkDirectly');
        },
      },
      {
        type: 'separator',
      }
    );
  }

  menu.push(
    {
      type: 'normal',
      label: '私用外出開始',
      click: () => {
        run('pauseWork');
      },
    },
    {
      type: 'normal',
      label: '私用外出終了',
      click: () => {
        run('restartWork');
      },
    },
    {
      type: 'separator',
    },
    {
      type: 'normal',
      label: 'ログイン・設定',
      click: open,
    },
    {
      type: 'separator',
    },
    {
      type: 'normal',
      label: 'AKASHI',
      click: () => {
        shell.openExternal('https://atnd.ak4.jp/login');
      },
    }
  );
  if (_release) {
    menu.push({
      type: 'normal',
      label: `🌟DakokuApp: ${release.getName(_release)}を入手する🌟`,
      click: () => {
        shell.openExternal(release.getHtmlUrl(_release));
      },
    });
  }
  menu.push({
    type: 'normal',
    label: '終了',
    click: app.quit,
  });

  return menu;
};

export const initialize = (
  open: () => void,
  run: (task: TaskType) => Promise<void>,
  showDirectly: boolean,
  _release: release.Release | null = null
): void => {
  if (tray) {
    tray.destroy();
  }

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate(generateMenu(open, run, showDirectly, _release));
  tray.setContextMenu(contextMenu);
};
