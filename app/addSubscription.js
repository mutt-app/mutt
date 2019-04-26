const electron = require('electron/electron');
const BrowserWindow = electron.remote.BrowserWindow;
const url = require('url')
const path = require('path')

let addWindow


// Handle create add window
function createAddWindow(){
  // Create the add window.
  addWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Add new travel subscription',
    webPreferences: {
      nodeIntegration: true
    }
  })
  // and load the index.html of the app.
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../addSubscription.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  addWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    addWindow = null
  })
}
window.createAddWindow = createAddWindow

