import path from 'path';
import { Menu, MenuItemConstructorOptions, MenuItem, Tray, app, shell } from 'electron';
import openAboutWindow from 'about-window';
import { TaskType } from './dakoku';
import { Release } from './release';

let tray: Tray | null = null;

const getIconResourcePath = (iconPath: string): string => {
  return process.env.NODE_ENV !== 'development'
    ? path.join(process.resourcesPath, iconPath)
    : path.join(__dirname, '..', iconPath);
};
const icon = getIconResourcePath('img/icon.png');
const trayIcon = getIconResourcePath('img/TrayIconTemplate.png');

const generateMenuItem = (
  type: 'normal' | 'separator',
  label?: string,
  click?: (menuItem: MenuItem) => void
): MenuItem => {
  return new MenuItem({ type, label, click });
};

const generateMenu = (
  open: () => void,
  run: (task: TaskType) => Promise<void>,
  showDirectly: boolean,
  release: Release | null
): (MenuItemConstructorOptions | MenuItem)[] => {
  const separator = generateMenuItem('separator');
  const startWork = generateMenuItem('normal', '出勤打刻');
  const startTelework = generateMenuItem('normal', '出勤打刻・テレワーク開始');
  const finishWork = generateMenuItem('normal', '退勤打刻');
  const startWorkDirectly = generateMenuItem('normal', '直行打刻');
  const finishWorkDirectly = generateMenuItem('normal', '直帰打刻');
  const pauseWork = generateMenuItem('normal', '私用外出開始');
  const restartWork = generateMenuItem('normal', '私用外出終了');
  const loginAndSetting = generateMenuItem('normal', 'ログイン・設定', open);
  const akashi = generateMenuItem('normal', 'AKASHI', () => {
    shell.openExternal('https://atnd.ak4.jp/login');
  });
  const aboutDakokuApp = generateMenuItem('normal', 'DakokuApp について', () => {
    openAboutWindow({
      icon_path: icon,
      homepage: 'https://github.com/TaneAkashi/DakokuApp',
      bug_report_url: 'https://github.com/TaneAkashi/DakokuApp/issues',
      copyright: 'Copyright ©️ 2021 DakokuApp',
      use_version_info: true,
    });
  });
  const releaseLink = generateMenuItem('normal', `🌟DakokuApp: ${release?.name}を入手する🌟`, () => {
    shell.openExternal(release?.html_url + '');
  });
  const quit = generateMenuItem('normal', '終了', app.quit);

  const dakokuItemAndTaskTypes: { menuItem: MenuItem; taskType: TaskType }[] = [
    { menuItem: startWork, taskType: 'startWork' },
    { menuItem: startTelework, taskType: 'startTelework' },
    { menuItem: finishWork, taskType: 'finishWork' },
    { menuItem: startWorkDirectly, taskType: 'startWorkDirectly' },
    { menuItem: finishWorkDirectly, taskType: 'finishWorkDirectly' },
    { menuItem: pauseWork, taskType: 'pauseWork' },
    { menuItem: restartWork, taskType: 'restartWork' },
  ];

  // 打刻中は打刻できないようにする
  dakokuItemAndTaskTypes.forEach(({ menuItem, taskType }) => {
    const dakokuItems = dakokuItemAndTaskTypes.map(({ menuItem }) => menuItem);
    menuItem.click = async () => {
      try {
        dakokuItems.forEach((item) => (item.enabled = false));
        await run(taskType);
      } finally {
        dakokuItems.forEach((item) => (item.enabled = true));
      }
    };
  });

  const itemAndCondition: [MenuItem, boolean][] = [
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
    [aboutDakokuApp, true],
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

  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate(generateMenu(open, run, showDirectly, release));
  tray.setContextMenu(contextMenu);
};
