import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import dbInstance from './database'
import { registerAccountHandlers } from './handlers/accountHandler'
import { registerAssetPairHandlers } from './handlers/assetPairHandler'
import { registerOrderHandlers } from './handlers/orderHandler'
import { registerRPCManagerHandlers } from './handlers/rpcManagerHandler'

let mainWindow: BrowserWindow | null = null

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js')
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

// Initialize database and start WebSocket client
dbInstance.getWebSocketClient().startWebSocket()

// Register IPC handlers
registerAccountHandlers()
registerAssetPairHandlers()
registerOrderHandlers()
registerRPCManagerHandlers()

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
