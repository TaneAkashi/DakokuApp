import path from 'path';

type Resource = 'icon' | 'trayIcon';

export const getPath = (resource: Resource): string => {
  const resourcePath = {
    icon: 'img/icon.png',
    trayIcon: 'img/TrayIconTemplate.png',
  }[resource];
  return process.env.NODE_ENV !== 'development'
    ? path.join(process.resourcesPath, resourcePath)
    : path.join(__dirname, '..', resourcePath);
};
