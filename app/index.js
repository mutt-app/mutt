const electron = require('electron');
const {ipcRenderer} = electron;
const ul = document.querySelector('ul');

ipcRenderer.on('add_subscription', function(e, item){
  console.log(item)
  ul.className = 'collection';
  const li = document.createElement('li');
  li.className = 'collection-item';
  const itemText = document.createTextNode(item);
  li.appendChild(itemText);
  ul.appendChild(li);
});