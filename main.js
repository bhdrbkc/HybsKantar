const { app, BrowserWindow, Menu,ipcMain  } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const Shortcut = require('electron-shortcut');
require('electron-reload')(__dirname);


  Object.defineProperty(app, 'isPackaged', {
    get() {
      return true;
    }
  });


var onclose = false;

function createWindow() {

  const mainWindow = new BrowserWindow({
    //titleBarStyle: 'hidden',
    //transparent: false,
    //frame: false,
    fullscreen: true,
    width: 1152,
    height: 864,
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
  mainWindow.setMenu(null)
  mainWindow.loadFile('app/index.html');

  


 
  mainWindow.on('close', function (e) {
    onclose = true;
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


  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
  });
  
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
  });
  
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
  });
  
  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });

    
  // ipcMain.on('check-update', () => {
  //   autoUpdater.checkForUpdatesAndNotify().then(function(result) { 
  //     console.info(result); 
  //   }, function(error) { 
  //     console.warn(error); 
  //   }); 
      
  // });

}



app.whenReady().then(() => {
  createWindow();

  

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })


  autoUpdater.checkForUpdatesAndNotify().then(function(result) { 
    console.info(result); 
  }, function(error) { 
    console.warn(error); 
  }); 

});




app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('browser-window-blur', function (e) {
  if (!onclose)
    e.sender.show();
});




