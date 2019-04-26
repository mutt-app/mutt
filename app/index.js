const electron = require('electron')
const {ipcRenderer} = electron

ipcRenderer.on('add_subscription', function (e, item) {
  console.log(item)
})