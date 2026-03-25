// Must mock SDK before any imports that reference it
jest.mock('@thesingularitynetwork/darkswap-sdk', () => ({
  DarkSwapError: class DarkSwapError extends Error {
    constructor(msg: string) { super(msg); this.name = 'DarkSwapError' }
  }
}))

jest.mock('@fireblocks/fireblocks-web3-provider', () => ({
  FireblocksWeb3Provider: jest.fn()
}))

const mockProvider = {
  getNetwork: jest.fn().mockResolvedValue({ chainId: 1 })
}
const mockWalletInstance = {
  address: '0xTestWallet',
  signTypedData: jest.fn()
}

jest.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => mockProvider),
    Wallet: jest.fn().mockImplementation(() => ({
      address: '0xTestWallet',
      signTypedData: jest.fn()
    }))
  }
}))

import { RpcManager, WalletResolver } from '../../../electron/core/common/rpcManager'
import { DarkSwapConfig, WalletConfig } from '../../../electron/core/types'

function makeConfig(overrides: Partial<DarkSwapConfig> = {}): DarkSwapConfig {
  return {
    wallets: [],
    chainRpcs: [{ chainId: 1, rpcUrl: 'http://localhost:8545' }],
    dbFilePath: '/tmp/test.db',
    bookNodeSocketUrl: 'wss://test',
    bookNodeApiUrl: 'https://test',
    bookNodeApiKey: 'test-key',
    ...overrides
  }
}

function makeWallet(address: string, privateKey = '0xabc123'): WalletConfig {
  return {
    name: 'test-wallet',
    address,
    privateKey,
    type: 'privateKey'
  }
}

describe('RpcManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSignerAndPublicKey', () => {
    it('should return signer when wallet is found in static config', () => {
      const wallet = makeWallet('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
      const config = makeConfig({ wallets: [wallet] })
      const rpcManager = new RpcManager(config)

      const [signer, publicKey] = rpcManager.getSignerAndPublicKey(
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        1
      )

      expect(signer).toBeDefined()
      expect(publicKey).toBe('0x')
    })

    it('should find wallet case-insensitively', () => {
      const wallet = makeWallet('0xAbCdEf1234567890AbCdEf1234567890AbCdEf12')
      const config = makeConfig({ wallets: [wallet] })
      const rpcManager = new RpcManager(config)

      const [signer] = rpcManager.getSignerAndPublicKey(
        '0xabcdef1234567890abcdef1234567890abcdef12',
        1
      )

      expect(signer).toBeDefined()
    })

    it('should throw when wallet not found and no resolver provided', () => {
      const config = makeConfig({ wallets: [] })
      const rpcManager = new RpcManager(config)

      expect(() =>
        rpcManager.getSignerAndPublicKey('0xNotFound', 1)
      ).toThrow('No wallet found for address: 0xNotFound')
    })

    it('should use WalletResolver as fallback when wallet not in static config', () => {
      const config = makeConfig({ wallets: [] })
      const resolvedWallet = makeWallet('0xDynamicWallet')
      const resolver: WalletResolver = jest.fn().mockReturnValue(resolvedWallet)

      const rpcManager = new RpcManager(config, resolver)
      const [signer] = rpcManager.getSignerAndPublicKey('0xDynamicWallet', 1)

      expect(resolver).toHaveBeenCalledWith('0xDynamicWallet')
      expect(signer).toBeDefined()
    })

    it('should not call resolver when wallet is found in static config', () => {
      const wallet = makeWallet('0xStaticWallet')
      const config = makeConfig({ wallets: [wallet] })
      const resolver: WalletResolver = jest.fn()

      const rpcManager = new RpcManager(config, resolver)
      rpcManager.getSignerAndPublicKey('0xStaticWallet', 1)

      expect(resolver).not.toHaveBeenCalled()
    })

    it('should throw when resolver returns null', () => {
      const config = makeConfig({ wallets: [] })
      const resolver: WalletResolver = jest.fn().mockReturnValue(null)

      const rpcManager = new RpcManager(config, resolver)

      expect(() =>
        rpcManager.getSignerAndPublicKey('0xNotFound', 1)
      ).toThrow('No wallet found for address: 0xNotFound')
      expect(resolver).toHaveBeenCalledWith('0xNotFound')
    })

    it('should cache signer after first lookup', () => {
      const wallet = makeWallet('0xCachedWallet')
      const config = makeConfig({ wallets: [wallet] })
      const rpcManager = new RpcManager(config)

      const [signer1] = rpcManager.getSignerAndPublicKey('0xCachedWallet', 1)
      const [signer2] = rpcManager.getSignerAndPublicKey('0xCachedWallet', 1)

      expect(signer1).toBe(signer2)
    })

    it('should cache signer resolved via WalletResolver', () => {
      const config = makeConfig({ wallets: [] })
      const resolvedWallet = makeWallet('0xResolvedCached')
      const resolver: WalletResolver = jest.fn().mockReturnValue(resolvedWallet)

      const rpcManager = new RpcManager(config, resolver)

      rpcManager.getSignerAndPublicKey('0xResolvedCached', 1)
      rpcManager.getSignerAndPublicKey('0xResolvedCached', 1)

      // Resolver should only be called once — second call uses cache
      expect(resolver).toHaveBeenCalledTimes(1)
    })

    it('should throw when provider not found for chainId', () => {
      const wallet = makeWallet('0xWallet')
      const config = makeConfig({ wallets: [wallet], chainRpcs: [] })
      const rpcManager = new RpcManager(config)

      expect(() =>
        rpcManager.getSignerAndPublicKey('0xWallet', 999)
      ).toThrow('No provider found for chainId: 999')
    })
  })

  describe('getProvider', () => {
    it('should return provider for configured chainId', () => {
      const config = makeConfig()
      const rpcManager = new RpcManager(config)

      const provider = rpcManager.getProvider(1)
      expect(provider).toBeDefined()
    })

    it('should throw for unconfigured chainId', () => {
      const config = makeConfig()
      const rpcManager = new RpcManager(config)

      expect(() => rpcManager.getProvider(999)).toThrow(
        'No provider found for chainId: 999'
      )
    })
  })

  describe('reloadProviders', () => {
    it('should clear cached signers and providers', () => {
      const wallet = makeWallet('0xReloadWallet')
      const config = makeConfig({ wallets: [wallet] })
      const rpcManager = new RpcManager(config)

      // Cache a signer
      const [signer1] = rpcManager.getSignerAndPublicKey('0xReloadWallet', 1)

      // Reload
      rpcManager.reloadProviders()

      // After reload, should create new signer (not cached)
      const [signer2] = rpcManager.getSignerAndPublicKey('0xReloadWallet', 1)
      expect(signer2).not.toBe(signer1)
    })
  })
})
