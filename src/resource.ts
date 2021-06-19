import path from 'path';

type Resource = 'icon' | 'trayIcon';

export const getPath = (resource: Resource): string => {
  const iconPath = {
    icon: 'img/icon.png',
    trayIcon: 'img/TrayIconTemplate.png',
  }[resource];
  return process.env.NODE_ENV !== 'development'
    ? path.join(process.resourcesPath, iconPath)
    : path.join(__dirname, '..', iconPath);
};
