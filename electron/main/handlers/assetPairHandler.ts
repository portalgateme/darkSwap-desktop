import { ipcMain } from 'electron'
import { db } from '../database'
import { getCurrentInstance } from '../utils/coreReloader'

export const registerAssetPairHandlers = () => {
  ipcMain.handle('assetPair:syncAssetPairs', async (event) => {
    const dbInstance = getCurrentInstance()
    await dbInstance.getAssetPairService().syncAssetPairs()
    return true
  })

  ipcMain.handle(
    'assetPair:syncAssetPair',
    async (event, assetPairId, chainId) => {
      const dbInstance = getCurrentInstance()
      await dbInstance.getAssetPairService().syncAssetPair(assetPairId, chainId)
      return true
    }
  )

  ipcMain.handle('assetPair:getAssetPairs', async (event, chainId) => {
    const assetPairs = db
      .prepare('SELECT * FROM ASSET_PAIRS WHERE chainId = ?')
      .all(chainId)
    return assetPairs
  })
}
