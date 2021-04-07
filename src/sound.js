const { BrowserWindow } = require('electron');

const play = async (task = null) => {
  const window = new BrowserWindow({
    show: false,
  });

  const url = (() => {
    const base = 'https://atnd.ak4.jp/punch/';
    switch (task) {
      case 'startWork':
      case 'startTelework': {
        return base + 's01.mp3';
      }
      case 'finishWork': {
        return base + 't01.mp3';
      }
      case 'startWorkDirectly':
      case 'finishWorkDirectly':
      case 'pauseWork':
      case 'restartWork': {
        return base + 'e01.mp3';
      }
      default: {
        return base + 'error.mp3';
      }
    }
  })();

  await window.loadURL(`data:text/html;utf8,<audio src="${url}" autoplay></audio>`);
  setTimeout(() => {
    window.close();
  }, 10000);
};

exports.play = play;
