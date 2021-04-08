const { ipcRenderer } = require('electron');

const saveDakokuOptions = (email, password, company) => {
  return ipcRenderer.invoke('saveDakokuOptions', email, password, company);
};

const saveSlackOptions = (url, icon_emoji, username) => {
  return ipcRenderer.invoke('saveSlackOptions', url, icon_emoji, username);
};

const saveOtherOptions = (sound, showDirectly) => {
  return ipcRenderer.invoke('saveOtherOptions', sound, showDirectly);
};

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('store-data', (event, options) => {
    document.getElementById('email').value = options.username;
    document.getElementById('office').value = options.company;
    document.getElementById('slack-url').value = options.slack.url;
    document.getElementById('slack-icon_emoji').value = options.slack.icon_emoji;
    document.getElementById('slack-username').value = options.slack.username;
    document.getElementById('sound').checked = options.sound;
    document.getElementById('show-directly').checked = options.showDirectly;
  });

  document.getElementById('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveDakokuOptions(
      document.getElementById('email').value,
      document.getElementById('password').value,
      document.getElementById('office').value
    );
    document.getElementById('password').value = '';
    alert('保存しました');
  });

  document.getElementById('slack').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveSlackOptions(
      document.getElementById('slack-url').value,
      document.getElementById('slack-icon_emoji').value,
      document.getElementById('slack-username').value
    );
    alert('保存しました');
  });

  document.getElementById('other').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveOtherOptions(document.getElementById('sound').checked, document.getElementById('show-directly').checked);
    alert('保存しました');
  });

  document.getElementById('close').addEventListener('click', (event) => {
    event.preventDefault();
    ipcRenderer.invoke('closeWindow');
  });
});
