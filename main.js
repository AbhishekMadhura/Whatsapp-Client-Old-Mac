const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');

const CONFIG = {
  title: 'WhatsApp',
  url: 'https://web.whatsapp.com',
  partition: 'persist:whatsapp',
  inApp: [],
};

const ICON = path.join(__dirname, 'assets', 'brand', 'logo-1024.png');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

let win;
let isQuitting = false;

const hostAllowed = (url) => {
  try {
    const h = new URL(url).hostname;
    return CONFIG.inApp.some((d) => h === d || h.endsWith('.' + d));
  } catch { return false; }
};

function createWindow() {
  const ses = session.fromPartition(CONFIG.partition);
  ses.setPermissionRequestHandler((_wc, permission, cb) => {
    cb(['media', 'notifications', 'fullscreen', 'clipboard-sanitized-write'].includes(permission));
  });

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: CONFIG.title,
    icon: ICON,
    webPreferences: { partition: CONFIG.partition, contextIsolation: true },
  });

  win.webContents.setUserAgent(UA);
  win.loadURL(CONFIG.url);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (hostAllowed(url)) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.on('close', (e) => {
    if (!isQuitting) { e.preventDefault(); win.hide(); }
  });

  win.webContents.on('page-title-updated', (_e, title) => {
    const m = title.match(/^\((\d+)\)/);
    if (app.dock) app.dock.setBadge(m ? m[1] : '');
  });
}

app.whenReady().then(() => {
  // Set the dock icon explicitly in dev; packaged builds read it from the bundle.
  if (process.platform === 'darwin' && app.dock) app.dock.setIcon(ICON);
  createWindow();
});

app.on('activate', () => win && win.show());
app.on('before-quit', () => { isQuitting = true; });
