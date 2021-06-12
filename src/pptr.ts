import { App, BrowserWindow } from 'electron';
import puppeteer from 'puppeteer-core';
import pie from 'puppeteer-in-electron';

let browser: puppeteer.Browser | null = null;

export const initialize = async (app: App): Promise<void> => {
  await pie.initialize(app);
  browser = await pie.connect(app, puppeteer);
};

export const getPage = (win: BrowserWindow): Promise<puppeteer.Page> => {
  if (!browser) throw new Error('browser is not initialized.');
  return pie.getPage(browser, win);
};
