import Store, { Schema } from 'electron-store';

type SchemaType = {
  username: string;
  password: string;
  company: string;
  sound: boolean;
  showDirectly: boolean;
  port: number;
  slack: {
    url: string;
    icon_emoji: string;
    username: string;
  };
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
  sound: {
    type: 'boolean',
    default: false,
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
};

type DakokuOptions = {
  username: string;
  password: string;
  company: string;
};

type SlackOptions = {
  url: string;
  icon_emoji: string;
  username: string;
};

type InitialOptions = Pick<DakokuOptions, 'username' | 'company'> & {
  slack: SlackOptions;
  sound: boolean;
  showDirectly: boolean;
};

export const initialize = (): void => {
  store = new Store<SchemaType>({ schema });
};

export const getSound = (): boolean => {
  if (!store) throw new Error();
  return store.get('sound', false);
};

export const getShowDirectly = (): boolean => {
  if (!store) throw new Error();
  return store.get('showDirectly', false);
};

export const getPort = (): number => {
  if (!store) throw new Error();
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
  if (!store) throw new Error();
  return {
    username: store.get('username'),
    password: store.get('password'),
    company: store.get('company'),
  };
};

export const saveDakokuOptions = (email: string, password: string, company: string): void => {
  if (!store) throw new Error();
  store.set('username', email);
  store.set('password', password);
  store.set('company', company);
};

export const getSlackOptions = (): SlackOptions => {
  if (!store) throw new Error();
  return {
    url: store.get('slack.url') || '',
    icon_emoji: store.get('slack.icon_emoji'),
    username: store.get('slack.username'),
  };
};

export const saveSlackOptions = (url: string, icon_emoji: string, username: string): void => {
  if (!store) throw new Error();
  store.set('slack.url', url);
  store.set('slack.icon_emoji', icon_emoji);
  store.set('slack.username', username);
};

export const saveOtherOptions = (sound: boolean, showDirectly: boolean): void => {
  if (!store) throw new Error();
  store.set('sound', sound);
  store.set('showDirectly', showDirectly);
};
