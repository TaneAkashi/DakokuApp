import { ipcRenderer } from 'electron';

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('version', (event, value) => {
    (document.getElementById('version') as HTMLInputElement).innerText = 'Version: ' + value;
  });
});
