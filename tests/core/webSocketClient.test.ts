// Mock ws module before imports
jest.mock('ws', () => ({
  WebSocket: jest.fn()
}))

jest.mock('tslog', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    trace: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }))
}))

import { WebSocketClient } from '../../electron/core/webSocketClient'
import { DarkSwapConfig, OrderDto, OrderStatus } from '../../electron/core/types'

function makeConfig(): DarkSwapConfig {
  return {
    wallets: [],
    chainRpcs: [],
    dbFilePath: '/tmp/test.db',
    bookNodeSocketUrl: 'wss://test',
    bookNodeApiUrl: 'https://test',
    bookNodeApiKey: 'test-key'
  }
}

function makeOrderDto(): OrderDto {
  const dto = new OrderDto()
  dto.orderId = 'order-1'
  dto.chainId = 1
  dto.wallet = '0xTestWallet'
  dto.status = OrderStatus.OPEN
  return dto
}

function createMockServices() {
  return {
    settlementService: {
      aliceSwap: jest.fn().mockResolvedValue(undefined),
      bobConfirm: jest.fn().mockResolvedValue(undefined),
      bobPostSettlement: jest.fn().mockResolvedValue(undefined),
      matchedForAlice: jest.fn().mockResolvedValue(undefined)
    },
    assetPairService: {
      syncAssetPair: jest.fn().mockResolvedValue(undefined)
    },
    orderService: {
      cancelOrderByNotificaion: jest.fn().mockResolvedValue(undefined),
      triggerOrder: jest.fn().mockResolvedValue(undefined)
    },
    dbService: {
      getOrderByOrderId: jest.fn().mockReturnValue(makeOrderDto())
    },
    walletMutexService: {
      getMutex: jest.fn().mockReturnValue({
        runExclusive: jest.fn().mockImplementation((fn: () => Promise<void>) => fn())
      })
    }
  }
}

describe('WebSocketClient', () => {
  let client: WebSocketClient
  let mocks: ReturnType<typeof createMockServices>
  let logger: { trace: jest.Mock; info: jest.Mock; error: jest.Mock; warn: jest.Mock }

  beforeEach(() => {
    jest.clearAllMocks()
    mocks = createMockServices()
    client = new WebSocketClient(
      makeConfig(),
      mocks.settlementService as any,
      mocks.assetPairService as any,
      mocks.orderService as any,
      mocks.dbService as any,
      mocks.walletMutexService as any
    )
    // Access the logger instance from the client
    logger = (client as any).logger
  })

  // Helper to call private processMessage
  async function processMessage(data: string) {
    await (client as any).processMessage({ data })
  }

  describe('processMessage - EventType.OrderConfirmed (eventType=2)', () => {
    it('should call settlementService.aliceSwap for OrderConfirmed event', async () => {
      const message = JSON.stringify({
        eventType: 2,
        orderId: 'order-1',
        status: 'confirmed'
      })

      await processMessage(message)

      expect(mocks.dbService.getOrderByOrderId).toHaveBeenCalledWith('order-1')
      expect(mocks.settlementService.aliceSwap).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'order-1' })
      )
    })

    it('should log wallet-not-found error with actionable message', async () => {
      const walletError = new Error('No wallet found for address: 0xMissing')
      mocks.settlementService.aliceSwap.mockRejectedValue(walletError)

      const message = JSON.stringify({
        eventType: 2,
        orderId: 'order-1'
      })

      await processMessage(message)

      expect(logger.error).toHaveBeenCalledWith(
        'Wallet not found during event processing. Ensure the wallet is configured and core is reloaded.',
        expect.objectContaining({
          error: 'No wallet found for address: 0xMissing'
        })
      )
    })

    it('should log generic error for non-wallet errors', async () => {
      const genericError = new Error('Some other error')
      mocks.settlementService.aliceSwap.mockRejectedValue(genericError)

      const message = JSON.stringify({
        eventType: 2,
        orderId: 'order-1'
      })

      await processMessage(message)

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to process message:',
        expect.any(String)
      )
    })
  })

  describe('processMessage - other event types', () => {
    it('should call bobConfirm for OrderMatchedAsBob (eventType=1)', async () => {
      const message = JSON.stringify({ eventType: 1, orderId: 'order-1' })

      await processMessage(message)

      expect(mocks.settlementService.bobConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'order-1' })
      )
    })

    it('should call matchedForAlice for OrderMatchedAsAlice (eventType=6)', async () => {
      const message = JSON.stringify({ eventType: 6, orderId: 'order-1' })

      await processMessage(message)

      expect(mocks.settlementService.matchedForAlice).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'order-1' })
      )
    })

    it('should call bobPostSettlement for OrderSettled (eventType=3)', async () => {
      const message = JSON.stringify({ eventType: 3, orderId: 'order-1', txHash: '0xTx' })

      await processMessage(message)

      expect(mocks.settlementService.bobPostSettlement).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'order-1' }),
        '0xTx'
      )
    })

    it('should call syncAssetPair for AssetPairCreated (eventType=4)', async () => {
      const message = JSON.stringify({
        eventType: 4,
        assetPairId: 'pair-1',
        chainId: 1
      })

      await processMessage(message)

      expect(mocks.assetPairService.syncAssetPair).toHaveBeenCalledWith('pair-1', 1)
    })

    it('should call cancelOrderByNotificaion for orderCancelled (eventType=5)', async () => {
      const message = JSON.stringify({ eventType: 5, orderId: 'order-1' })

      await processMessage(message)

      expect(mocks.orderService.cancelOrderByNotificaion).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'order-1' })
      )
    })

    it('should call triggerOrder for OrderTriggered (eventType=7)', async () => {
      const message = JSON.stringify({ eventType: 7, orderId: 'order-1' })

      await processMessage(message)

      expect(mocks.orderService.triggerOrder).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'order-1' })
      )
    })

    it('should log error for unknown event type', async () => {
      const message = JSON.stringify({ eventType: 99 })

      await processMessage(message)

      expect(logger.error).toHaveBeenCalledWith('Unknown event:', { eventType: 99 })
    })
  })

  // =========================================================
  // OrderMatchedAsBob (eventType=1) - Edge Cases
  // =========================================================
  describe('processMessage - EventType.OrderMatchedAsBob edge cases', () => {
    it('should acquire mutex with correct chainId and lowercase wallet', async () => {
      const orderDto = makeOrderDto()
      orderDto.wallet = '0xMixedCaseWallet'
      mocks.dbService.getOrderByOrderId.mockReturnValue(orderDto)

      const message = JSON.stringify({ eventType: 1, orderId: 'order-1' })
      await processMessage(message)

      expect(mocks.walletMutexService.getMutex).toHaveBeenCalledWith(1, '0xmixedcasewallet')
    })

    it('should log error when bobConfirm throws generic error', async () => {
      mocks.settlementService.bobConfirm.mockRejectedValue(new Error('bobConfirm failed'))

      const message = JSON.stringify({ eventType: 1, orderId: 'order-1' })
      await processMessage(message)

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to process message:',
        expect.any(String)
      )
    })

    it('should log wallet-not-found error when bobConfirm throws wallet error', async () => {
      mocks.settlementService.bobConfirm.mockRejectedValue(
        new Error('No wallet found for address: 0xUnknown')
      )

      const message = JSON.stringify({ eventType: 1, orderId: 'order-1' })
      await processMessage(message)

      expect(logger.error).toHaveBeenCalledWith(
        'Wallet not found during event processing. Ensure the wallet is configured and core is reloaded.',
        expect.objectContaining({
          error: 'No wallet found for address: 0xUnknown'
        })
      )
    })

    it('should log info message with orderId for OrderMatchedAsBob', async () => {
      const message = JSON.stringify({ eventType: 1, orderId: 'order-42' })
      await processMessage(message)

      expect(logger.info).toHaveBeenCalledWith(
        'Event for order matched as Bob: ',
        'order-42'
      )
    })
  })

  // =========================================================
  // OrderConfirmed (eventType=2) - Edge Cases
  // =========================================================
  describe('processMessage - EventType.OrderConfirmed edge cases', () => {
    it('should acquire mutex with correct chainId and lowercase wallet', async () => {
      const orderDto = makeOrderDto()
      orderDto.wallet = '0xUpperWALLET'
      mocks.dbService.getOrderByOrderId.mockReturnValue(orderDto)

      const message = JSON.stringify({ eventType: 2, orderId: 'order-1' })
      await processMessage(message)

      expect(mocks.walletMutexService.getMutex).toHaveBeenCalledWith(1, '0xupperwallet')
    })

    it('should log info message with orderId for OrderConfirmed', async () => {
      const message = JSON.stringify({ eventType: 2, orderId: 'order-99' })
      await processMessage(message)

      expect(logger.info).toHaveBeenCalledWith(
        'Event for order confirmed: ',
        'order-99'
      )
    })
  })

  // =========================================================
  // OrderSettled (eventType=3) - Edge Cases
  // =========================================================
  describe('processMessage - EventType.OrderSettled edge cases', () => {
    it('should pass empty string as txHash when not provided in message', async () => {
      const message = JSON.stringify({ eventType: 3, orderId: 'order-1' })
      await processMessage(message)

      expect(mocks.settlementService.bobPostSettlement).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'order-1' }),
        ''
      )
    })

    it('should acquire mutex with correct chainId and lowercase wallet', async () => {
      const orderDto = makeOrderDto()
      orderDto.wallet = '0xABCDef'
      mocks.dbService.getOrderByOrderId.mockReturnValue(orderDto)

      const message = JSON.stringify({ eventType: 3, orderId: 'order-1', txHash: '0xTx' })
      await processMessage(message)

      expect(mocks.walletMutexService.getMutex).toHaveBeenCalledWith(1, '0xabcdef')
    })

    it('should log error when bobPostSettlement throws generic error', async () => {
      mocks.settlementService.bobPostSettlement.mockRejectedValue(
        new Error('Settlement processing failed')
      )

      const message = JSON.stringify({ eventType: 3, orderId: 'order-1', txHash: '0xTx' })
      await processMessage(message)

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to process message:',
        expect.any(String)
      )
    })

    it('should log wallet-not-found error when bobPostSettlement throws wallet error', async () => {
      mocks.settlementService.bobPostSettlement.mockRejectedValue(
        new Error('No wallet found for address: 0xGone')
      )

      const message = JSON.stringify({ eventType: 3, orderId: 'order-1', txHash: '0xTx' })
      await processMessage(message)

      expect(logger.error).toHaveBeenCalledWith(
        'Wallet not found during event processing. Ensure the wallet is configured and core is reloaded.',
        expect.objectContaining({
          error: 'No wallet found for address: 0xGone'
        })
      )
    })

    it('should log info message with orderId for OrderSettled', async () => {
      const message = JSON.stringify({ eventType: 3, orderId: 'order-77', txHash: '0xTx' })
      await processMessage(message)

      expect(logger.info).toHaveBeenCalledWith(
        'Event for order settled: ',
        'order-77'
      )
    })
  })

  // =========================================================
  // General error handling
  // =========================================================
  describe('processMessage - error handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      await processMessage('not-valid-json')

      expect(logger.error).toHaveBeenCalled()
    })

    it('should handle non-Error thrown objects', async () => {
      mocks.settlementService.aliceSwap.mockRejectedValue('string-error')

      const message = JSON.stringify({ eventType: 2, orderId: 'order-1' })
      await processMessage(message)

      expect(logger.error).toHaveBeenCalledWith(
        'Caught non-standard error:',
        expect.any(String)
      )
    })

    it('should handle Error with empty message', async () => {
      mocks.settlementService.bobConfirm.mockRejectedValue(new Error(''))

      const message = JSON.stringify({ eventType: 1, orderId: 'order-1' })
      await processMessage(message)

      // Empty message should not match wallet-not-found pattern
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to process message:',
        expect.any(String)
      )
    })

    it('should handle error thrown as object (not Error instance)', async () => {
      mocks.settlementService.aliceSwap.mockRejectedValue({ code: 500, msg: 'internal' })

      const message = JSON.stringify({ eventType: 2, orderId: 'order-1' })
      await processMessage(message)

      expect(logger.error).toHaveBeenCalledWith(
        'Caught non-standard error:',
        expect.any(String)
      )
    })
  })
})
