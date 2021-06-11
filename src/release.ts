import get from 'axios';
import { app, Notification, shell } from 'electron';
import * as dakoku from './dakoku';
import * as settingsWindow from './settings-window';
import * as store from './store';
import * as tray from './tray';

export type Release = {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: number;
  prerelease: number;
  created_at: string;
  published_at: string;
  assets: string[];
  tarball_url: string;
  zipball_url: string;
  body: string;
};

/** @see https://docs.github.com/en/rest/reference/repos#get-the-latest-release */
const LATEST_API_URL = 'https://api.github.com/repos/TaneAkashi/DakokuApp/releases/latest';

let latestRelease: Release;

export const getLatest = (): Release => {
  return latestRelease;
};

const fetchLatest = async (): Promise<Release | null> => {
  const version = await get(LATEST_API_URL)
    .then((res) => res.data)
    .catch(() => null);
  return version;
};

const updateLatest = async (): Promise<void> => {
  const latest = await fetchLatest();
  if (latest) {
    latestRelease = latest;
  }
};

export const isLatest = (): boolean => {
  // タグ名とpackage.jsonのversionを比較する
  // tag_name: v1.0.0
  // app.getVersion(): 1.0.0
  return !!latestRelease && latestRelease.tag_name.slice(1) === app.getVersion();
};

// 通知を管理する変数
// 同じバージョンに対して行われる通知はアプリのライフサイクル毎に１回
let notifiedVersion = '';

const notifyIfNotNotified = () => {
  if (notifiedVersion === latestRelease.tag_name) {
    return;
  }

  const notification = new Notification({
    title: latestRelease.tag_name + 'がリリースされました！',
    body: 'メニューから新しい' + app.getName() + 'を入手しましょう！',
  });
  notification.on('click', () => {
    shell.openExternal(latestRelease.html_url);
  });
  notification.show();

  notifiedVersion = latestRelease.tag_name;
};

export const doIfNotLatest = async (): Promise<void> => {
  await updateLatest();
  if (isLatest()) {
    return;
  }

  tray.initialize(settingsWindow.open, dakoku.runByMenu, store.getShowDirectly(), latestRelease);
  notifyIfNotNotified();
};
