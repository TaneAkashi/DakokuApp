import { app } from 'electron';
import log from 'electron-log';
import { getPassword, setPassword } from 'keytar';

const generateEncryptionKey = () => {
  return Math.random().toString(36);
};

export const getEncryptionKey = async (): Promise<string> => {
  const service = app.getName();
  const account = 'store';

  let encryptionKey = await getPassword(service, account);
  if (encryptionKey === null) {
    log.info('EncryptionKey not found. Generate new one.');
    encryptionKey = generateEncryptionKey();
    setPassword(service, account, encryptionKey);
  }
  return encryptionKey;
};
