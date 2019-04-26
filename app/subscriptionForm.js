const {ipcRenderer, remote} = require('electron')
const $ = require('jquery')

const form = document.querySelector('form')
form.addEventListener('submit', submitForm)

function submitForm(e) {
  e.preventDefault()
  ipcRenderer.send('add_subscription', $(e.target).serializeArray())
  const window = remote.getCurrentWindow()
  window.close()
  return true
}