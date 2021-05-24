import Store, { Schema } from 'electron-store';
import { Release } from './release';
import { SoundPackId } from './sound';

export type StoreRelease = Pick<
  Release,
  'html_url' | 'id' | 'node_id' | 'tag_name' | 'name' | 'draft' | 'prerelease' | 'body'
>;

/*
electron-store の migrations の使用は、前方互換性の問題を考慮する必要がある。
リリースの新旧でmigrationsを適用し、electorn-store内のキーの型が変化した場合、旧リリースでの起動ができなくなる。
この問題を避けるため、キーの型を変えて使いたい場合、別名のキーを使用し、旧キー名は使用不可とする運用を採用する。
以下のキーは過去に使用されたキーである。
- [<=v1.0.0] sound: boolean
*/
type SchemaType = {
  username: string;
  password: string;
  company: string;
  soundPack: SoundPackId;
  showDirectly: boolean;
  port: number;
  slack: {
    url: string;
    icon_emoji: string;
    username: string;
  };
  release: StoreRelease;
};

let store: Store<SchemaType> | null = null;

const schema: Schema<SchemaType> = {
  username: {
    type: 'string',
    default: '',
  },
  password: {
    type: 'string',
    default: '',
  },
  company: {
    type: 'string',
    default: '',
  },
  soundPack: {
    type: 'string',
    default: 'none',
  },
  showDirectly: {
    type: 'boolean',
    default: false,
  },
  port: {
    type: 'number',
    default: 9999,
  },
  slack: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        default: '',
      },
      icon_emoji: {
        type: 'string',
        default: '',
      },
      username: {
        type: 'string',
        default: '',
      },
    },
    default: {
      url: '',
    },
    additionalProperties: false,
  },
  release: {
    type: 'object',
    default: undefined,
  },
};

type DakokuOptions = Pick<SchemaType, 'username' | 'password' | 'company'>;

type SlackOptions = SchemaType['slack'];

type InitialOptions = Pick<DakokuOptions, 'username' | 'company'> & {
  slack: SlackOptions;
  sound: SchemaType['soundPack'];
  showDirectly: SchemaType['showDirectly'];
};

export const initialize = (): void => {
  store = new Store<SchemaType>({ schema });
};

export const getSound = (): SoundPackId => {
  if (!store) throw new Error('store is not initialized.');
  return store.get('soundPack', 'none');
};

export const getShowDirectly = (): boolean => {
  if (!store) throw new Error('store is not initialized.');
  return store.get('showDirectly', false);
};

export const getPort = (): number => {
  if (!store) throw new Error('store is not initialized.');
  return store.get('port', 9999);
};

export const getInitialOptions = (): InitialOptions => {
  const dakokuOptions = getDakokuOptions();

  return {
    username: dakokuOptions.username,
    company: dakokuOptions.company,
    slack: getSlackOptions(),
    sound: getSound(),
    showDirectly: getShowDirectly(),
  };
};

export const getDakokuOptions = (): DakokuOptions => {
  if (!store) throw new Error('store is not initialized.');
  return {
    username: store.get('username'),
    password: store.get('password'),
    company: store.get('company'),
  };
};

export const getRelease = (): StoreRelease | null => {
  if (!store) throw new Error('store is not initialized.');
  // electron-store schema は object | null のような型を取れないので undefined を null とみなして扱う
  return store.get('release') || null;
};

export const saveDakokuOptions = (email: string, password: string, company: string): void => {
  if (!store) throw new Error('store is not initialized.');
  store.set('username', email);
  store.set('password', password);
  store.set('company', company);
};

export const getSlackOptions = (): SlackOptions => {
  if (!store) throw new Error('store is not initialized.');
  return {
    url: store.get('slack.url') || '',
    icon_emoji: store.get('slack.icon_emoji'),
    username: store.get('slack.username'),
  };
};

export const saveSlackOptions = (url: string, icon_emoji: string, username: string): void => {
  if (!store) throw new Error('store is not initialized.');
  store.set('slack.url', url);
  store.set('slack.icon_emoji', icon_emoji);
  store.set('slack.username', username);
};

export const saveOtherOptions = (soundPack: SoundPackId, showDirectly: boolean): void => {
  if (!store) throw new Error('store is not initialized.');
  store.set('soundPack', soundPack);
  store.set('showDirectly', showDirectly);
};

export const saveRelease = (release: StoreRelease | null): void => {
  if (!store) throw new Error('store is not initialized.');
  // electron-store schema は object | null のような型を取れないので undefined を null とみなして扱う
  store.set('release', release || undefined);
};
