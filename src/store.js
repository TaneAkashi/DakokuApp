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

const getSound = () => {
  return store.get('sound', false);
};

const getShowDirectly = () => {
  return store.get('showDirectly', false);
};

const getPort = () => {
  return store.get('port', 9999);
};

const getInitialOptions = () => {
  const dakokuOptions = getDakokuOptions();

  return {
    username: dakokuOptions.username,
    company: dakokuOptions.company,
    slack: getSlackOptions(),
    sound: getSound(),
    showDirectly: getShowDirectly(),
  };
};

const getDakokuOptions = () => {
  return {
    username: store.get('username'),
    password: store.get('password'),
    company: store.get('company'),
  };
};

const saveDakokuOptions = (email, password, company) => {
  store.set('username', email);
  store.set('password', password);
  store.set('company', company);
};

const getSlackOptions = () => {
  return {
    url: store.get('slack.url') || '',
    icon_emoji: store.get('slack.icon_emoji') || undefined,
    username: store.get('slack.username') || undefined,
  };
};

const saveSlackOptions = (url, icon_emoji, username) => {
  store.set('slack.url', url);
  store.set('slack.icon_emoji', icon_emoji);
  store.set('slack.username', username);
};

const saveOtherOptions = (sound, showDirectly) => {
  store.set('sound', sound);
  store.set('showDirectly', showDirectly);
};

exports.initialize = initialize;
exports.getSound = getSound;
exports.getShowDirectly = getShowDirectly;
exports.getPort = getPort;
exports.getInitialOptions = getInitialOptions;
exports.getDakokuOptions = getDakokuOptions;
exports.saveDakokuOptions = saveDakokuOptions;
exports.getSlackOptions = getSlackOptions;
exports.saveSlackOptions = saveSlackOptions;
exports.saveOtherOptions = saveOtherOptions;
