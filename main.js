const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const Shortcut = require('electron-shortcut');
require('electron-reload')(__dirname);




function createWindow() {


  const mainWindow = new BrowserWindow({
    //titleBarStyle: 'hidden',
    //transparent: false,
    //frame: false,
    width: 1024,
    height: 768,
    alwaysOnTop: true,
    //y: 0, x: 0,
    minimizable: false,
    type: 'desktop',
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      defaultEncoding: 'UTF-8',
      worldSafeExecuteJavaScript: true,
      enableRemoteModule: true,
      maximizable: true
    }
  });
  mainWindow.setAlwaysOnTop(true)
  mainWindow.maximize();
  mainWindow.focus();
  mainWindow.loadFile('app/index.html');

  mainWindow.setMenu(null)


  mainWindow.on('close', function(e) {
    const choice = require('electron').dialog.showMessageBoxSync(this,
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Çıkmak istediğinizden emin misiniz?'
      });
    if (choice === 1) {
      e.preventDefault();
    }
  });

  var shortcut = new Shortcut('Ctrl+F12', function (e) {
    console.log("openDevTools")
    mainWindow.webContents.openDevTools();
  });




}



app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});




app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})

app.on('browser-window-blur', function (e) {
  
  e.sender.show();



})

