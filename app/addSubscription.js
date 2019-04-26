const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const url = require('url')
const path = require('path')

let addWindow

// Handle create add window
exports.createAddWindow = function createAddWindow(){
  // Create the add window.
  addWindow = new BrowserWindow({
    width: 434,
    height: 211,
    title: 'Add new subscription',
    webPreferences: {
      nodeIntegration: true
    }
  })
  // and load the index.html of the app.
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, './addSubscription.html'),
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
