
const { app, BrowserWindow,Menu } = require('electron');
const path = require('path');
const Shortcut = require('electron-shortcut');
require('electron-reload')(__dirname);



function createWindow() {

  
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    alwaysOnTop: true,
    y: 0, x: 0,
    minimizable: true,    
    type: 'desktop',
    webPreferences: {      
      worldSafeExecuteJavaScript: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      defaultEncoding: 'UTF-8',
      worldSafeExecuteJavaScript: true,
      enableRemoteModule: true,
      maximizable: true,

    }
  });
  mainWindow.maximize();
  mainWindow.focus();
  mainWindow.loadFile('app/index.html');
  mainWindow.setProgressBar(0.1);

  mainWindow.setMenu(null)

  // Open the DevTools.
  var shortcut = new Shortcut('Ctrl+F12', function (e) {
    console.log("openDevTools")
    mainWindow.webContents.openDevTools();
  });

}

app.setUserTasks([
  {
    program: process.execPath,
    arguments: '',
    iconPath: process.execPath,
    iconIndex: 0,
    title: 'HYBS WEB',
    description: 'HYBS WEB'
  }
])

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
