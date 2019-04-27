// Modules to control application life and create native browser window
const {app, Tray, Menu, BrowserWindow, ipcMain, nativeImage} = require('electron')
const url = require('url')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

app.isQuiting = false

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'app/icons/app_icon.png'),
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))
  mainWindow.loadFile('app/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Continue to handle mainWindow "close" event here
  mainWindow.on('close', function(e){
    if(!app.isQuiting){
      e.preventDefault()
      mainWindow.hide();
    } else {
      app.quit()
    }
  })
}

ipcMain.on('add_subscription', function (e, item) {
  mainWindow.webContents.send('add_subscription', item)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
  createTray()

  // You can use 'before-quit' instead of (or with) the close event
  app.on('before-quit', function (e) {
    // Handle menu-item or keyboard shortcut quit here
    app.isQuiting = true
  });

  app.on('activate-with-no-open-windows', function(){
    mainWindow.show();
  });
})

// This is another place to handle events after all windows are closed
app.on('will-quit', function () {
  // This is a good place to add tests insuring the app is still
  // responsive and all windows are closed.
  mainWindow = null;
});

const createTray = () => {
  const trayIconPath = path.join(__dirname, 'app/icons/tray.png');
  let trayIcon = nativeImage.createFromPath(trayIconPath);
  trayIcon = trayIcon.resize({ width: 16, height: 16 });
  const tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click:  function(){
        mainWindow.show();
      } },
    { label: 'Quit', click:  function(){
        app.isQuiting = true
        app.quit()
      }
    }
  ]);
  tray.setContextMenu(contextMenu)
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }  else {
    mainWindow.show()
  }
})