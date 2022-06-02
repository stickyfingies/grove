const path = require('path');
const { app, BrowserWindow } = require('electron');
const http = require('http');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const isDev = process.env.IS_DEV === 'true';
const REST_PORT = process.env.PORT || 3333;

function main() {
    // Define window
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            sandbox: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
    });
    win.removeMenu();

    // Launch window
    if (isDev) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, 'build', 'index.html'));
    }

    // REST API
    const server = http.createServer(async (req, res) => {
        if (req.url !== '/' && req.method === 'GET') {
            const endpoint = req.url.split('/')[1];
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(endpoint);
            res.end();
            win.webContents.openDevTools();
            win.webContents.send(endpoint);
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Route not found' }));
        }
    });
    server.listen(REST_PORT, () => {
        console.log(`server started on port: ${REST_PORT}`);
    });
}

// Launch app
app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');
app
    .on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    })
    .whenReady().then(() => {
        main();
        app.on('activate', () => {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (BrowserWindow.getAllWindows().length === 0) main();
        });
    });