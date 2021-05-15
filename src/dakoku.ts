import * as akashi from 'akashi-dakoku-core';
import { BrowserWindow, Notification, Tray } from 'electron';
import { Block, KnownBlock } from '@slack/types';
import * as pptr from './pptr';
import * as slack from './slack';
import * as sound from './sound';
import * as store from './store';
import * as release from './release';
import { sleep } from './utils/sleep';

export type TaskType = keyof ReturnType<typeof akashi.dakoku>;

type Options = {
  username: string;
  password: string;
  company: string;
};

let win: BrowserWindow | null = null;

const destroyWindow = () => {
  if (win) {
    win.destroy();
    win = null;
  }
};

export const run = async (task: TaskType, options: Options): Promise<akashi.Result> => {
  if (win) {
    throw new Error('別の打刻が実行されています');
  }

  try {
    win = new BrowserWindow({
      show: false,
    });

    // 打刻処理
    const run = async (win: BrowserWindow) => {
      const page = await pptr.getPage(win);
      const result = await akashi.dakoku(page)[task](options);
      return result;
    };

    // 10秒でタイムアウトでエラーにする
    const timerForTimeout = async (): Promise<void> => {
      await sleep(10000);
      throw new Error('タイムアウトしました');
    };

    // Promise.race で早く終了したほうを返す
    // timerForTimeout は resolve しないため、as で型を指定している
    const result = (await Promise.race([run(win), timerForTimeout()])) as akashi.Result;
    destroyWindow();
    return result;
  } catch (e) {
    destroyWindow();
    throw e;
  }
};

export const runByMenu = async (task: TaskType): Promise<void> => {
  const dakokuOptions = store.getDakokuOptions();
  const slackOptions = store.getSlackOptions();

  type Payload = {
    success: boolean;
    soundType: TaskType | 'error';
    notification: {
      title: string;
      body: string;
    };
    slack: {
      text: string;
      blocks?: (Block | KnownBlock)[];
    };
  };

  const payload: Payload = await run(task, dakokuOptions)
    .then((result) => {
      return {
        success: true,
        soundType: task,
        notification: {
          title: result.status + (result.telework ? ` ${result.telework}` : ''),
          body: result.note ? `アラート: ${result.note}` : '',
        },
        slack: slack.generateSuccessMessage(result.status, result.note, result.telework),
      };
    })
    .catch((e) => {
      const message = e instanceof Error ? e.message : '打刻に失敗しました';
      return {
        success: false,
        soundType: 'error',
        notification: {
          title: message,
          body: '',
        },
        slack: {
          text: `:warning: ${message}`,
        },
      };
    });

  if (store.getSound()) {
    sound.play(payload.soundType);
  }

  const notification = new Notification({
    ...payload.notification,
    timeoutType: 'default',
  });
  notification.show();

  if (slackOptions.url) {
    await slack.sendMessage(slackOptions, payload.slack.text, payload.slack.blocks);
  }

  // 打刻時に更新がないか調べる
  // 打刻通知と被るのを防ぐため30秒程度遅延させる
  setTimeout(release.doIfReleaseExists, 30000);
};
