const {
  app, globalShortcut, protocol, BrowserWindow,
} = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      // webSecurity: false,
      // preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.removeMenu();
  win.loadFile('../../views/play.html');

  globalShortcut.register('f5', () => win.loadFile('../../views/play.html'));
  globalShortcut.register('CommandOrControl+R', () => win.loadFile('../../views/play.html'));

  globalShortcut.register('f12', () => win.webContents.toggleDevTools());
  globalShortcut.register('CommandOrControl+Shift+I', () => win.webContents.toggleDevTools());
}

app.whenReady().then(() => {
  createWindow();

  protocol.interceptFileProtocol('file', (request, callback) => {
    let url = request.url.substr(8);
    const ext = path.extname(url);

    if (ext !== '.html') {
      url = path.join(__dirname, '../../static/', url.substr(3));
      console.log(url);
    }

    callback({ path: url });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
