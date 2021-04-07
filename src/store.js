const Store = require('electron-store');

let store = null;

const schema = {
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

const initialize = () => {
  store = new Store({ schema });
};

const get = (...args) => {
  return store.get(...args);
};

const set = (...args) => {
  return store.set(...args);
};

const getStore = () => {
  return store.store;
};

const getSlackOptions = () => {
  return {
    url: store.get('slack.url') || '',
    icon_emoji: store.get('slack.icon_emoji') || undefined,
    username: store.get('slack.username') || undefined,
  };
};

exports.initialize = initialize;
exports.get = get;
exports.set = set;
exports.getStore = getStore;
exports.getSlackOptions = getSlackOptions;
