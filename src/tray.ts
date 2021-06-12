import path from 'path';
import { Menu, MenuItemConstructorOptions, MenuItem, Tray, app, shell } from 'electron';
import { TaskType } from './dakoku';
import { Release } from './release';

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
    type,
    label,
    click,
  };
};

const generateMenu = (
  open: () => void,
  run: (task: TaskType) => Promise<void>,
  showDirectly: boolean,
  release: Release | null
): (MenuItemConstructorOptions | MenuItem)[] => {
  const separator = generateMenuItem('separator');
  const startWork = generateMenuItem('normal', '出勤打刻', () => {
    run('startWork');
  });
  const startTelework = generateMenuItem('normal', '出勤打刻・テレワーク開始', () => {
    run('startTelework');
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
  const releaseLink = generateMenuItem('normal', `🌟DakokuApp: ${release?.name}を入手する🌟`, () => {
    shell.openExternal(release?.html_url + '');
  });
  const quit = generateMenuItem('normal', '終了', app.quit);
  const itemAndCondition: [MenuItemConstructorOptions, boolean][] = [
    [startWork, true],
    [startTelework, true],
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
    [releaseLink, release !== null],
    [quit, true],
  ];
  const menu = itemAndCondition.filter(([, condition]) => condition).map(([item]) => item);
  return menu;
};

export const initialize = (
  open: () => void,
  run: (task: TaskType) => Promise<void>,
  showDirectly: boolean,
  release: Release | null = null
): void => {
  if (tray) {
    tray.destroy();
  }

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate(generateMenu(open, run, showDirectly, release));
  tray.setContextMenu(contextMenu);
};
