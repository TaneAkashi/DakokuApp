import { App, BrowserWindow } from 'electron';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-core';
import pie from 'puppeteer-in-electron';

let browser: Browser | null = null;

export const initialize = async (app: App, port: number): Promise<void> => {
  await pie.initialize(app, port);
  browser = await pie.connect(app, puppeteer);
};

export const getBrowser = (): Browser => {
  if (!browser) throw new Error('browser is not initialized.');
  return browser;
};

export const getPage = (win: BrowserWindow): Promise<Page> => {
  if (!browser) throw new Error('browser is not initialized.');
  return pie.getPage(browser, win);
};
