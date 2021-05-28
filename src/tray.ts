import path from 'path';
import { Menu, MenuItemConstructorOptions, MenuItem, Tray, app, shell } from 'electron';
import { TaskType } from './dakoku';
import { StoreRelease } from './store';
import { filter } from './utils/conditionTuple';

let tray: Tray | null = null;

const getIcon = (): string => {
  return process.env.NODE_ENV !== 'development'
    ? path.join(process.resourcesPath, 'img/TrayIconTemplate.png')
    : 'img/TrayIconTemplate.png';
};
const icon = getIcon();

const generateMenuItem = (
  type: 'normal' | 'separator',
  label?: string,
  click?: (menuItem: MenuItem) => void
): MenuItemConstructorOptions => {
  return {
    type: type,
    label: label,
    click: click,
  };
};

const generateMenu = (
  open: () => void,
  run: (task: TaskType) => Promise<void>,
  showDirectly: boolean,
  storeRelease: StoreRelease | null
): (MenuItemConstructorOptions | MenuItem)[] => {
  const separator = generateMenuItem('separator');
  const startWork = generateMenuItem('normal', '出勤打刻', () => {
    run('startWork');
  });
  const finishWork = generateMenuItem('normal', '退勤打刻', () => {
    run('finishWork');
  });
  const startWorkDirectly = generateMenuItem('normal', '直行打刻', () => {
    run('startWorkDirectly');
  });
  const finishWorkDirectly = generateMenuItem('normal', '直帰打刻', () => {
    run('finishWorkDirectly');
  });
  const pauseWork = generateMenuItem('normal', '私用外出開始', () => {
    run('pauseWork');
  });
  const restartWork = generateMenuItem('normal', '私用外出終了', () => {
    run('restartWork');
  });
  const loginAndSetting = generateMenuItem('normal', 'ログイン・設定', open);
  const akashi = generateMenuItem('normal', 'AKASHI', () => {
    shell.openExternal('https://atnd.ak4.jp/login');
  });
  const release = generateMenuItem('normal', `🌟DakokuApp: ${storeRelease?.name}を入手する🌟`, () => {
    shell.openExternal(storeRelease?.html_url + '');
  });
  const quit = generateMenuItem('normal', '終了', app.quit);
  const menu: MenuItemConstructorOptions[] = filter([
    [startWork, true],
    [finishWork, true],
    [separator, true],
    [startWorkDirectly, showDirectly],
    [finishWorkDirectly, showDirectly],
    [separator, showDirectly],
    [pauseWork, true],
    [restartWork, true],
    [separator, true],
    [loginAndSetting, true],
    [separator, true],
    [akashi, true],
    [release, !!storeRelease],
    [quit, true],
  ]);
  return menu;
};

export const initialize = (
  open: () => void,
  run: (task: TaskType) => Promise<void>,
  showDirectly: boolean,
  release: StoreRelease | null = null
): void => {
  if (tray) {
    tray.destroy();
  }

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate(generateMenu(open, run, showDirectly, release));
  tray.setContextMenu(contextMenu);
};
