const {ipcRenderer} = require('electron')
const $ = require('jquery')

const form = document.querySelector('form')
form.addEventListener('submit', submitForm)

function submitForm(e) {
  e.preventDefault()
  ipcRenderer.send('add_subscription', $(e.target).serializeArray())
  return true
}