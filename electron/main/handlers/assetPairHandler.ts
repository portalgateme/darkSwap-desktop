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

  ipcMain.handle('assetPair:getTokensByChainId', async (event, chainId: number) => {
    const assetPairs = db
      .prepare('SELECT * FROM ASSET_PAIRS WHERE chainId = ?')
      .all(chainId) as Array<{
        baseAddress: string
        baseSymbol: string
        baseDecimal: number
        quoteAddress: string
        quoteSymbol: string
        quoteDecimal: number
      }>

    const tokenMap = new Map<string, { address: string; symbol: string; name: string; decimals: number }>()

    for (const pair of assetPairs) {
      const baseKey = pair.baseAddress.toLowerCase()
      if (!tokenMap.has(baseKey)) {
        tokenMap.set(baseKey, {
          address: pair.baseAddress,
          symbol: pair.baseSymbol,
          name: pair.baseSymbol,
          decimals: pair.baseDecimal
        })
      }

      const quoteKey = pair.quoteAddress.toLowerCase()
      if (!tokenMap.has(quoteKey)) {
        tokenMap.set(quoteKey, {
          address: pair.quoteAddress,
          symbol: pair.quoteSymbol,
          name: pair.quoteSymbol,
          decimals: pair.quoteDecimal
        })
      }
    }

    return Array.from(tokenMap.values())
  })
}
