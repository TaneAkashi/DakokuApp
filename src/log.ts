import log from 'electron-log';
import { app } from 'electron';

export const initialize = (): void => {
  // ログファイルへは info ログ以上のログレベルを出力
  log.transports.file.level = 'info';
  log.info(`${app.getName()} process has launched.`);
  process.on('unhandledRejection', (err, p) => {
    log.error(err);
  });
  process.on('uncaughtException', (err) => {
    log.error(err);
    app.quit();
  });
};

interface dakokuAppLogFunction {
  (message: string, object?: { [K in string]: any }): void;
}

// アプリケーションの継続が困難となる情報
export const error: dakokuAppLogFunction = log.error;

// 機能の提供に失敗した情報
export const warn: dakokuAppLogFunction = log.warn;

// 機能の提供に関する情報
export const info: dakokuAppLogFunction = log.info;

// デバッグに必要な情報
export const debug: dakokuAppLogFunction = log.debug;
