import path from 'path';
import { Menu, MenuItemConstructorOptions, MenuItem, Tray, app, shell } from 'electron';
import { TaskType } from './dakoku';
import { StoreRelease } from './store';

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
): MenuItem => {
  return new MenuItem({ type, label, click });
};

const generateMenu = (
  open: () => void,
  run: (task: TaskType) => Promise<void>,
  showDirectly: boolean,
  storeRelease: StoreRelease | null
): (MenuItemConstructorOptions | MenuItem)[] => {
  const separator = generateMenuItem('separator');
  const startWork = generateMenuItem('normal', '出勤打刻');
  const finishWork = generateMenuItem('normal', '退勤打刻');
  const startWorkDirectly = generateMenuItem('normal', '直行打刻');
  const finishWorkDirectly = generateMenuItem('normal', '直帰打刻');
  const pauseWork = generateMenuItem('normal', '私用外出開始');
  const restartWork = generateMenuItem('normal', '私用外出終了');
  const loginAndSetting = generateMenuItem('normal', 'ログイン・設定', open);
  const akashi = generateMenuItem('normal', 'AKASHI', () => {
    shell.openExternal('https://atnd.ak4.jp/login');
  });
  const release = generateMenuItem('normal', `🌟DakokuApp: ${storeRelease?.name}を入手する🌟`, () => {
    shell.openExternal(storeRelease?.html_url + '');
  });
  const quit = generateMenuItem('normal', '終了', app.quit);

  const dakokuItemAndTaskTypes: [MenuItem, TaskType][] = [
    [startWork, 'startWork'],
    [finishWork, 'finishWork'],
    [startWorkDirectly, 'startWorkDirectly'],
    [finishWorkDirectly, 'finishWorkDirectly'],
    [pauseWork, 'pauseWork'],
    [restartWork, 'restartWork'],
  ];

  // 打刻中は打刻できないようにする
  dakokuItemAndTaskTypes.forEach(([item, taskType]) => {
    const dakokuItems = dakokuItemAndTaskTypes.map(([item]) => item);
    item.click = async () => {
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
    [release, storeRelease !== null],
    [quit, true],
  ];
  const menu = itemAndCondition.filter(([, condition]) => condition).map(([item]) => item);
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
