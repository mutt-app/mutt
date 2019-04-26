const {ipcRenderer} = require('electron')
const $ = require('jquery')

const form = document.querySelector('form')
form.addEventListener('submit', submitForm)

function submitForm(e) {
  e.preventDefault()
  console.log($(e.target).serializeArray())
  const origin = document.querySelector('#origin').value
  ipcRenderer.send('add_subscription', origin)
  return true
}