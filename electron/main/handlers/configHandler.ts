import { ipcMain } from 'electron'
import dbInstance, { config, db, dbPath } from '../database'
import { DarkSwapClientCore, DarkSwapConfig } from 'darkswap-client-core'

export function registerConfigHandlers() {
  ipcMain.handle('config:getConfigs', async (event) => {
    const result = await db.prepare('SELECT * FROM configs').all()
    return result
  })

  ipcMain.handle('config:setConfig', async (event, key, value) => {
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO configs (key, value) VALUES (?, ?)'
    )
    stmt.run(key, value)
    return { success: true }
  })

  // update to handle multiple configs
  ipcMain.handle(
    'config:setConfigs',
    async (event, configs: { [key: string]: string }) => {
      const insert = db.prepare(
        'INSERT INTO configs (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
      )
      const insertMany = db.transaction(
        (configs: { [key: string]: string }) => {
          for (const key in configs) {
            insert.run(key, configs[key])
          }
        }
      )
      insertMany(configs)
      return { success: true }
    }
  )

  // Heathcheck config handler
  ipcMain.handle('config:healthCheck', async (event, apiKey: string) => {
    try {
      if (!config) {
        throw new Error('Failed to load configuration')
      }

      console.log(
        '=>>>>>>>>>>>>>>>>>>>>> Running health check with API key:',
        apiKey
      )

      const darkSwapConfig: DarkSwapConfig = {
        wallets: [],
        chainRpcs: config.chainRpcs || [],
        dbFilePath: dbPath,
        bookNodeSocketUrl:
          config.bookNodeSocketUrl || 'wss://socket.darknode.io',
        bookNodeApiUrl: config.bookNodeApiUrl || 'https://api.darknode.io/api',
        bookNodeApiKey: apiKey
      }
      const instance = new DarkSwapClientCore(darkSwapConfig, db)
      const healthy = await instance
        .getWebSocketClient()
        .startWebSocket()
        .isAuthenticated()
      console.log('Health check result:', healthy)
      return { healthy }
    } catch (error: any) {
      return { healthy: false }
    }
  })
}
