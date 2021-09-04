import path from 'path';
import {
    BrowserWindow,
    app,
    globalShortcut,
    protocol,
} from 'electron';

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            sandbox: true,
        },
    });

    win.removeMenu();
    win.loadFile('../../views/play.html');
    // win.loadURL('https://wgpu.rs/examples');

    globalShortcut.register('f5', () => win.loadFile('../../views/play.html'));
    globalShortcut.register('CommandOrControl+R', () => win.loadFile('../../views/play.html'));

    globalShortcut.register('f12', () => win.webContents.toggleDevTools());
    globalShortcut.register('CommandOrControl+Shift+I', () => win.webContents.toggleDevTools());

    // correctly load relative file paths from the 'dist' directory
    protocol.interceptFileProtocol('file', (request, callback) => {
        let url = request.url.substr(8);
        const ext = path.extname(url);
        if (ext !== '.html') {
            url = path.join(__dirname, '../../dist/', url.substr(3));
        }
        callback({ path: url });
    });
};

// The following command line switches disable DPI scaling
// app.commandLine.appendSwitch('high-dpi-support', 1);
// app.commandLine.appendSwitch('force-device-scale-factor', 1);

app
    .on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    })
    .whenReady().then(createWindow);
