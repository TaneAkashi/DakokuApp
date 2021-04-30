import * as akashi from 'akashi-dakoku-core';
import { BrowserWindow, Notification } from 'electron';
import { Block, KnownBlock } from '@slack/types';
import * as browser from './browser';
import * as slack from './slack';
import * as sound from './sound';
import * as store from './store';

export type TaskType = keyof ReturnType<typeof akashi.dakoku>;

type Options = {
  username: string;
  password: string;
  company: string;
};

let dakokuWindow: BrowserWindow | null = null;

export const run = async (task: TaskType, options: Options): Promise<akashi.Result> => {
  if (dakokuWindow) {
    throw new Error('別の打刻が実行されています');
  }

  try {
    dakokuWindow = new BrowserWindow({
      show: false,
    });
    const page = await browser.getPage(dakokuWindow);
    const result = await akashi.dakoku(page)[task](options);

    if (dakokuWindow) {
      dakokuWindow.destroy();
      dakokuWindow = null;
    }
    return result;
  } catch (e) {
    if (dakokuWindow) {
      dakokuWindow.destroy();
      dakokuWindow = null;
    }
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
};
