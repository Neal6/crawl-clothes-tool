import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { machineIdSync } from 'node-machine-id'
import axios from 'axios'
import icon from '../../resources/icon.png?asset'
import { startCheck } from '../services'

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 900,
    show: false,
    // autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // mainWindow.webContents.openDevTools()

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

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
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('show-error-form-msg', () => {
  dialog.showMessageBox({
    title: 'System error',
    message: 'Please enter all information',
    type: 'error'
  })
})

ipcMain.on('data-upload-invalid', () => {
  dialog.showMessageBox({
    title: 'System error',
    message: 'Please upload valid file',
    type: 'error'
  })
})

ipcMain.on('show-system-error', () => {
  dialog.showMessageBox({
    title: 'System error',
    message: 'Something went wrong',
    type: 'error'
  })
})

ipcMain.on('show-warning-full-limit', () => {
  dialog.showMessageBox({
    title: 'System message',
    message: 'You’ve used all of your searches. Please wait for the counters to reset',
    type: 'info'
  })
})

ipcMain.on('show-warning-no-find', () => {
  dialog.showMessageBox({
    title: 'System message',
    message: 'No keywords found',
    type: 'info'
  })
})

ipcMain.handle('checkId', async () => {
  const id = machineIdSync(true)
  try {
    await axios.get('https://crawl-clothes-tool-node-app.onrender.com/api/check', {
      data: {
        device: id
      }
    })
    return false
  } catch (error) {
    return id
  }
})

ipcMain.handle('startCheck', async (event, params) => {
  const dataChecked = await startCheck(params)
  const id = machineIdSync(true)
  try {
    await axios.get('https://crawl-clothes-tool-node-app.onrender.com/api/check', {
      data: {
        device: id
      }
    })
    return dataChecked
  } catch (error) {
    app.quit()
  }
})
