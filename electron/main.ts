import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import dbInstance from './database'

let mainWindow: BrowserWindow | null = null

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.NODE_ENV === 'development') {
    await mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '../../renderer/out/index.html')
    mainWindow.loadFile(indexPath)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

dbInstance.getWebSocketClient().startWebSocket()

dbInstance
  .getAssetPairService()
  .syncAssetPairs()
  .then(() => {
    console.log('Asset pairs synced')
  })
  .catch((error) => {
    console.error('Error syncing asset pairs:', error)
  })

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
