const {ipcRenderer} = require('electron')

const form = document.querySelector('form')
form.addEventListener('submit', submitForm)

function submitForm(e) {
  e.preventDefault()
  const origin = document.querySelector('#origin').value
  ipcRenderer.send('add_subscription', origin)
  return true
}