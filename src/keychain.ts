import { app } from 'electron';
import { getPassword, setPassword } from 'keytar';

const generateEncryptionKey = () => {
  return Math.random().toString(36);
};

export const getEncryptionKey = async (): Promise<string> => {
  const service = app.getName();
  const account = 'store';

  let encryptionKey = await getPassword(service, account);
  if (encryptionKey === null) {
    encryptionKey = generateEncryptionKey();
    setPassword(service, account, encryptionKey);
  }
  return encryptionKey;
};
