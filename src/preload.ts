import { ipcRenderer } from 'electron';

const saveDakokuOptions = (email: string, password: string, company: string) => {
  return ipcRenderer.invoke('saveDakokuOptions', email, password, company);
};

const saveSlackOptions = (url: string, icon_emoji: string, username: string) => {
  return ipcRenderer.invoke('saveSlackOptions', url, icon_emoji, username);
};

const saveOtherOptions = (sound: boolean, showDirectly: boolean) => {
  return ipcRenderer.invoke('saveOtherOptions', sound, showDirectly);
};

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('store-data', (event, options) => {
    (document.getElementById('email') as HTMLInputElement).value = options.username;
    (document.getElementById('office') as HTMLInputElement).value = options.company;
    (document.getElementById('slack-url') as HTMLInputElement).value = options.slack.url;
    (document.getElementById('slack-icon_emoji') as HTMLInputElement).value = options.slack.icon_emoji;
    (document.getElementById('slack-username') as HTMLInputElement).value = options.slack.username;
    (document.getElementById('sound') as HTMLInputElement).checked = options.sound;
    (document.getElementById('show-directly') as HTMLInputElement).checked = options.showDirectly;
  });

  (document.getElementById('form') as HTMLFormElement).addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveDakokuOptions(
      (document.getElementById('email') as HTMLInputElement).value,
      (document.getElementById('password') as HTMLInputElement).value,
      (document.getElementById('office') as HTMLInputElement).value
    );
    (document.getElementById('password') as HTMLInputElement).value = '';
    alert('保存しました');
  });

  (document.getElementById('slack') as HTMLFormElement).addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveSlackOptions(
      (document.getElementById('slack-url') as HTMLInputElement).value,
      (document.getElementById('slack-icon_emoji') as HTMLInputElement).value,
      (document.getElementById('slack-username') as HTMLInputElement).value
    );
    alert('保存しました');
  });

  (document.getElementById('other') as HTMLFormElement).addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveOtherOptions(
      (document.getElementById('sound') as HTMLInputElement).checked,
      (document.getElementById('show-directly') as HTMLInputElement).checked
    );
    alert('保存しました');
  });
});
