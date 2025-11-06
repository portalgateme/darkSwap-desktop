import { CancelOrderDto, OrderDto, UpdatePriceDto } from 'darkswap-client-core'
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => 'pong from Electron'
})

// Account APIs
contextBridge.exposeInMainWorld('accountAPI', {
  addWallet: (
    name: string,
    address: string,
    privateKey: string,
    type: 'privateKey' | 'fireblocks'
  ) => ipcRenderer.invoke('account:addWallet', name, address, privateKey, type),
  removeWallet: (walletId: number) =>
    ipcRenderer.invoke('account:removeWallet', walletId),
  getWallets: () => ipcRenderer.invoke('account:getWallets'),
  getAssetsByChainIdAndWallet: (chainId: number, wallet: string) =>
    ipcRenderer.invoke('account:getAssetsByChainIdAndWallet', chainId, wallet),
  syncAssets: (chainId: number, wallet: string) =>
    ipcRenderer.invoke('account:syncAssets', chainId, wallet),
  syncOneAsset: (chainId: number, wallet: string, asset: string) =>
    ipcRenderer.invoke('account:syncOneAsset', chainId, wallet, asset),
  deposit: (chainId: number, wallet: string, asset: string, amount: number) =>
    ipcRenderer.invoke('account:deposit', chainId, wallet, asset, amount),
  withdraw: (chainId: number, wallet: string, asset: string, amount: number) =>
    ipcRenderer.invoke('account:withdraw', chainId, wallet, asset, amount)
})

// Asset Pair APIs
contextBridge.exposeInMainWorld('assetPairAPI', {
  syncAssetPairs: () => ipcRenderer.invoke('assetPair:syncAssetPairs'),
  syncAssetPair: (assetPairId: string, chainId: number) =>
    ipcRenderer.invoke('assetPair:syncAssetPair', assetPairId, chainId),
  getAssetPairs: (chainId: number) =>
    ipcRenderer.invoke('assetPair:getAssetPairs', chainId)
})

// Order APIs
contextBridge.exposeInMainWorld('orderAPI', {
  createOrder: (orderDto: OrderDto) =>
    ipcRenderer.invoke('order:createOrder', orderDto),
  cancelOrder: (cancelOrderDto: CancelOrderDto) =>
    ipcRenderer.invoke('order:cancelOrder', cancelOrderDto),
  updateOrderPrice: (updatePriceDto: UpdatePriceDto) =>
    ipcRenderer.invoke('order:updateOrderPrice', updatePriceDto),
  getAllOrders: (status: number, page: number, limit: number) =>
    ipcRenderer.invoke('order:getAllOrders', status, page, limit),
  getOrderById: (orderId: string) =>
    ipcRenderer.invoke('order:getOrderById', orderId),
  getAssetPairs: (chainId: number) =>
    ipcRenderer.invoke('order:getAssetPairs', chainId),
  getOrderEvents: (orderId: string) =>
    ipcRenderer.invoke('order:getOrderEvents', orderId),
  getIncrementalOrderEvents: (lastEventId: number) =>
    ipcRenderer.invoke('order:getIncrementalOrderEvents', lastEventId)
})

// RPC Manager APIs
contextBridge.exposeInMainWorld('rpcManagerAPI', {
  getProvider: (chainId: number) =>
    ipcRenderer.invoke('rpcManager:getProvider', chainId),
  getSignerForUserSwapRelayer: (chainId: number) =>
    ipcRenderer.invoke('rpcManager:getSignerForUserSwapRelayer', chainId),
  getSignerAndPublicKey: (walletAddress: string, chainId: number) =>
    ipcRenderer.invoke(
      'rpcManager:getSignerAndPublicKey',
      walletAddress,
      chainId
    ),
  reloadProviders: () => ipcRenderer.invoke('rpcManager:reloadProviders')
})
