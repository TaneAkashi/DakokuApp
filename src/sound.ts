import { BrowserWindow } from 'electron';
import { TaskType } from './dakoku';

export type SoundTaskType = TaskType | 'error';
export type SoundPackId = 'akashi_default' | 'cheerful_girl' | 'none';
export type SoundPackTaskType = 'start' | 'finish' | 'meaningless' | 'error';

export const play = async (packId: SoundPackId, taskType: SoundTaskType = 'error'): Promise<void> => {
  const window = new BrowserWindow({
    show: false,
  });
  await window.loadURL(`data:text/html;utf8,<audio src="${urlResolver(packId, taskType)}" autoplay></audio>`);
  setTimeout(() => {
    window.close();
  }, 10000);
};

const loadSoundPack = (filename: string): { [key in SoundPackTaskType]: string | string[] } => {
  return require('../sound_pack/' + filename);
};

const urlResolver = (soundPackId: SoundPackId, task: SoundTaskType): string => {
  let soundPack;
  switch (soundPackId) {
    case 'none':
      return '';
    case 'akashi_default':
      soundPack = loadSoundPack('akashi_default.json');
      break;
    case 'cheerful_girl':
      soundPack = loadSoundPack('cheerful_girl.json');
      break;
  }

  let soundPackTaskType: SoundPackTaskType;
  switch (task) {
    case 'startWork':
    case 'startTelework': {
      soundPackTaskType = 'start';
      break;
    }
    case 'finishWork': {
      soundPackTaskType = 'finish';
      break;
    }
    case 'startWorkDirectly':
    case 'finishWorkDirectly':
    case 'pauseWork':
    case 'restartWork': {
      soundPackTaskType = 'meaningless';
      break;
    }
    case 'error':
    default: {
      soundPackTaskType = 'error';
      break;
    }
  }
  const stringOrStringArray = soundPack[soundPackTaskType];
  return typeof stringOrStringArray === 'string'
    ? stringOrStringArray
    : stringOrStringArray[Math.floor(Math.random() * stringOrStringArray.length)];
};
