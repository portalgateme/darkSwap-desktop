import { DarkSwapClientCore, DarkSwapConfig } from 'darkswap-client-core'
import { Database } from 'better-sqlite3'

import { ipcMain } from 'electron'
import { ConfigLoader } from '../../utils/configUtil'

interface CoreReloaderOptions {
  db: Database
  dbPath: string
}

let currentInstance: DarkSwapClientCore | null = null
let isReloading = false

const eventListeners: Set<(instance: DarkSwapClientCore) => void> = new Set()

/**
 * Initialize core reloader with database instance
 */
export function initializeCoreReloader(options: CoreReloaderOptions) {
  const { db, dbPath } = options

  // Register IPC handlers for core reload events
  ipcMain.handle('core:reload', async () => {
    console.log('Reloading DarkSwapClientCore...')
    await reloadCore(db, dbPath)
    return { success: true }
  })

  return {
    reloadCore: () => reloadCore(db, dbPath),
    getInstance: () => currentInstance,
    onCoreReloaded: (callback: (instance: DarkSwapClientCore) => void) => {
      eventListeners.add(callback)
      return () => eventListeners.delete(callback)
    }
  }
}

/**
 * Create a new DarkSwapClientCore instance with current config and wallets
 */
function createCoreInstance(
  db: Database,
  dbPath: string,
  apiKey?: string
): DarkSwapClientCore {
  const latestConfig = ConfigLoader.getInstance().getConfig()
  if (!latestConfig) {
    throw new Error('Failed to load configuration')
  }

  const darkSwapConfig: DarkSwapConfig = {
    wallets: latestConfig.wallets || [],
    chainRpcs: latestConfig.chainRpcs || [],
    dbFilePath: dbPath,
    bookNodeSocketUrl:
      latestConfig.bookNodeSocketUrl || 'wss://socket.darknode.io',
    bookNodeApiUrl:
      latestConfig.bookNodeApiUrl || 'https://api.darknode.io/api',
    bookNodeApiKey: apiKey || ''
  }

  const instance = new DarkSwapClientCore(darkSwapConfig, db)
  return instance
}

/**
 * Reload the DarkSwapClientCore instance
 * - Stop old services (WebSocket, AutoOrder)
 * - Create new instance with updated config/wallets
 * - Start new services
 * - Notify listeners
 */
export async function reloadCore(
  db: Database,
  dbPath: string,
  apiKey?: string
): Promise<void> {
  if (isReloading) {
    console.log('Core reload already in progress, skipping...')
    return
  }

  isReloading = true

  try {
    console.log('Starting DarkSwapClientCore reload...')

    // Get latest config
    const latestConfig = ConfigLoader.getInstance().getConfig()
    if (!latestConfig) {
      throw new Error('Core Reloader: Failed to load configuration')
    }

    // Stop old instance services
    if (currentInstance) {
      console.log('Stopping old services...')
      try {
        await currentInstance.getAutoOrderManager().stop()
      } catch (error) {
        console.error('Error stopping old services:', error)
      }
    }

    // Get API key from database if not provided
    if (!apiKey) {
      const configs = db.prepare('SELECT * FROM configs').all() as Array<{
        id: number
        key: string
        value: string
      }>
      apiKey = configs.find((c) => c.key === 'api_key')?.value || ''
    }

    // Load all wallets including from database
    const dbWallets = db.prepare('SELECT * FROM wallets').all() as Array<{
      id: number
      name: string
      address: string
      privateKey: string
      type: 'privateKey' | 'fireblocks'
    }>

    console.log('DB wallets loaded for core reload:', dbWallets)

    // Create updated config with fresh file config + db wallets
    const updatedConfig: DarkSwapConfig = {
      wallets: [...(latestConfig.wallets || []), ...dbWallets],
      chainRpcs: latestConfig.chainRpcs || [],
      dbFilePath: dbPath,
      bookNodeSocketUrl:
        latestConfig.bookNodeSocketUrl || 'wss://socket.darknode.io',
      bookNodeApiUrl:
        latestConfig.bookNodeApiUrl || 'https://api.darknode.io/api',
      bookNodeApiKey: apiKey
    }

    // Create new instance with updated config
    const newInstance = new DarkSwapClientCore(updatedConfig, db)
    currentInstance = newInstance
    console.log(
      `DarkSwapClientCore created with ${updatedConfig.wallets.length} wallets`
    )

    // Start services
    try {
      currentInstance.getAutoOrderManager().start()
      console.log('Auto order manager started')

      if (apiKey) {
        currentInstance.getWebSocketClient().startWebSocket()
        currentInstance.getAssetPairService().syncAssetPairs()
        console.log('WebSocket client started')
      }
    } catch (error) {
      console.error('Error starting services:', error)
    }

    // Notify all listeners
    eventListeners.forEach((listener) => {
      try {
        listener(currentInstance!)
      } catch (error) {
        console.error('Error in core reload listener:', error)
      }
    })
  } catch (error) {
    console.error('Error reloading DarkSwapClientCore:', error)
    throw error
  } finally {
    isReloading = false
  }
}

/**
 * Get or create the current core instance
 */
export function getOrCreateCoreInstance(
  db: Database,
  dbPath: string,
  apiKey?: string
): DarkSwapClientCore {
  if (!currentInstance) {
    currentInstance = createCoreInstance(db, dbPath, apiKey)

    // Start services
    try {
      currentInstance.getAutoOrderManager().start()

      if (apiKey) {
        currentInstance.getWebSocketClient().startWebSocket()
        currentInstance.getAssetPairService().syncAssetPairs()
      }
    } catch (error) {
      console.error('Error starting services:', error)
    }
  }

  return currentInstance
}

/**
 * Set the current instance (for testing or custom initialization)
 */
export function setCurrentInstance(instance: DarkSwapClientCore | null): void {
  currentInstance = instance
}

export function getCurrentInstance(): DarkSwapClientCore {
  if (!currentInstance) {
    throw new Error('DarkSwapClientCore instance is not initialized')
  }
  return currentInstance
}
