import get from 'axios';
import { app, Notification } from 'electron';
import * as dakoku from './dakoku';
import * as settingsWindow from './settings-window';
import * as store from './store';
import * as tray from './tray';

/** @see https://docs.github.com/en/rest/reference/repos#get-the-latest-release */
const LATEST_API_URL = 'https://api.github.com/repos/TaneAkashi/DakokuApp/releases/latest';

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

const fetchLatest = async (): Promise<Release | null> => {
  const version = await get(LATEST_API_URL)
    .then((res) => res.data)
    .catch(() => null);
  return version;
};

export const doIfReleaseExists = async (): Promise<void> => {
  const release = await fetchLatest();
  if (release && release.tag_name.slice(1) !== app.getVersion()) {
    store.saveRelease(release);
    tray.initialize(settingsWindow.open, dakoku.runByMenu, store.getShowDirectly(), store.getRelease());
    const notification = new Notification({
      title: release.tag_name + ' がリリースされました！',
      body: 'メニューから新しい' + app.getName() + 'を入手しましょう！',
    });
    notification.show();
  }
};
