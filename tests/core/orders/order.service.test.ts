import { OrderService } from '../../../electron/core/orders/order.service'
import {
  OrderDirection,
  OrderDto,
  OrderStatus,
  OrderType,
  TimeInForce,
  StpMode
} from '../../../electron/core/types'

// --- SDK mocks ---
const mockProCreatePrepare = jest.fn()
const mockProCreateExecute = jest.fn()
const mockProCancelPrepare = jest.fn()
const mockProCancelExecute = jest.fn()

jest.mock('@thesingularitynetwork/darkswap-sdk', () => ({
  DarkSwapError: class DarkSwapError extends Error {
    constructor(msg: string) { super(msg); this.name = 'DarkSwapError' }
  },
  ProCreateOrderService: jest.fn().mockImplementation(() => ({
    prepare: mockProCreatePrepare,
    execute: mockProCreateExecute
  })),
  ProCancelOrderService: jest.fn().mockImplementation(() => ({
    prepare: mockProCancelPrepare,
    execute: mockProCancelExecute
  }))
}))

jest.mock('../../../electron/core/config/networkConfig', () => ({
  getConfirmations: jest.fn().mockReturnValue(3)
}))

jest.mock('../../../electron/core/utils/priceUtil', () => ({
  checkPrice: jest.fn().mockReturnValue(true)
}))

const { checkPrice } = require('../../../electron/core/utils/priceUtil')

// --- DarkSwapContext mock ---
const mockCreateDarkSwapContext = jest.fn()
jest.mock('../../../electron/core/common/context/darkSwap.context', () => ({
  DarkSwapContext: {
    createDarkSwapContext: (...args: any[]) => mockCreateDarkSwapContext(...args)
  }
}))

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('auto-generated-id')
}))

// --- Helper factories ---
function makeAssetPair() {
  return {
    id: 'pair-1',
    chainId: 1,
    baseAddress: '0xBaseAsset',
    baseSymbol: 'BASE',
    baseDecimal: 18,
    quoteAddress: '0xQuoteAsset',
    quoteSymbol: 'QUOTE',
    quoteDecimal: 18
  }
}

function makeDarkSwapContext() {
  return {
    chainId: 1,
    walletAddress: '0xTestWallet',
    signer: {},
    publicKey: '0xPubKey',
    darkSwap: {
      provider: {
        waitForTransaction: jest.fn().mockResolvedValue({ status: 1 })
      }
    },
    signature: '0xSignature',
    noteCryptoContext: { key: 'test' }
  }
}

function makeOrderDto(overrides: Partial<OrderDto> = {}): OrderDto {
  const dto = new OrderDto()
  dto.orderId = 'order-1'
  dto.chainId = 1
  dto.wallet = '0xTestWallet'
  dto.assetPairId = 'pair-1'
  dto.orderDirection = OrderDirection.BUY
  dto.orderType = OrderType.LIMIT
  dto.timeInForce = TimeInForce.GTC
  dto.stpMode = StpMode.NONE
  dto.price = '2.0'
  dto.amountOut = '500'
  dto.amountIn = '1000'
  dto.feeRatio = '100'
  dto.status = OrderStatus.OPEN
  return Object.assign(dto, overrides)
}

function createMockServices() {
  return {
    dbService: {
      getAssetPairById: jest.fn().mockResolvedValue(makeAssetPair()),
      addOrderByDto: jest.fn().mockResolvedValue(undefined),
      getOrderByOrderId: jest.fn(),
      getNoteByCommitment: jest.fn(),
      cancelOrder: jest.fn().mockResolvedValue(undefined),
      updateOrderTriggered: jest.fn(),
      updateOrderPrice: jest.fn().mockResolvedValue(undefined)
    },
    noteService: {
      addNote: jest.fn(),
      setNoteUsed: jest.fn(),
      setNoteActive: jest.fn()
    },
    notesJoinService: {
      getCurrentBalanceNote: jest.fn()
    },
    bookNodeService: {
      createOrder: jest.fn().mockResolvedValue(undefined),
      cancelOrder: jest.fn().mockResolvedValue(undefined)
    },
    orderEventService: {
      logOrderStatusChange: jest.fn().mockResolvedValue(undefined)
    },
    rpcManager: {}
  }
}

describe('OrderService', () => {
  let service: OrderService
  let mocks: ReturnType<typeof createMockServices>
  let ctx: ReturnType<typeof makeDarkSwapContext>

  beforeEach(() => {
    jest.clearAllMocks()
    mocks = createMockServices()
    ctx = makeDarkSwapContext()
    checkPrice.mockReturnValue(true)
    service = new OrderService(
      mocks.dbService as any,
      mocks.noteService as any,
      mocks.notesJoinService as any,
      mocks.bookNodeService as any,
      mocks.orderEventService as any,
      mocks.rpcManager as any
    )
  })

  // =========================================================
  // createOrder
  // =========================================================
  describe('createOrder', () => {
    const currentBalance = {
      note: BigInt(50),
      rho: BigInt(10),
      asset: '0xQuoteAsset',
      amount: BigInt(1000),
      address: '0xTestWallet'
    }

    const orderNote = {
      note: BigInt(100),
      rho: BigInt(200),
      nullifier: BigInt(300),
      feeRatio: BigInt(100),
      asset: '0xQuoteAsset',
      amount: BigInt(500)
    }

    const newBalance = {
      note: BigInt(400),
      rho: BigInt(500),
      asset: '0xQuoteAsset',
      amount: BigInt(500)
    }

    beforeEach(() => {
      mocks.notesJoinService.getCurrentBalanceNote.mockResolvedValue(currentBalance)
      mockProCreatePrepare.mockResolvedValue({
        context: 'create-context',
        orderNote,
        newBalance
      })
      mockProCreateExecute.mockResolvedValue('0xCreateTx')
    })

    it('should create a BUY LIMIT order successfully', async () => {
      const dto = makeOrderDto()

      await service.createOrder(dto, ctx as any)

      // BUY: outAsset = quoteAddress, inAsset = baseAddress
      expect(mocks.notesJoinService.getCurrentBalanceNote).toHaveBeenCalledWith(ctx, '0xQuoteAsset')
      expect(mockProCreatePrepare).toHaveBeenCalledWith(
        '0xTestWallet',
        '0xQuoteAsset',
        BigInt(500),
        '0xBaseAsset',
        BigInt(1000),
        currentBalance,
        '0xSignature',
        ctx.noteCryptoContext
      )
      expect(mockProCreateExecute).toHaveBeenCalledWith('create-context')
      expect(mocks.noteService.setNoteUsed).toHaveBeenCalledWith(currentBalance, ctx)
      expect(mocks.noteService.setNoteActive).toHaveBeenCalledWith(orderNote, ctx, '0xCreateTx')
      expect(mocks.dbService.addOrderByDto).toHaveBeenCalled()
      expect(mocks.bookNodeService.createOrder).toHaveBeenCalled()
      expect(mocks.orderEventService.logOrderStatusChange).toHaveBeenCalledWith(
        'order-1', '0xTestWallet', 1, OrderStatus.OPEN
      )
    })

    it('should create a SELL order with correct asset direction', async () => {
      const dto = makeOrderDto({ orderDirection: OrderDirection.SELL })

      await service.createOrder(dto, ctx as any)

      // SELL: outAsset = baseAddress, inAsset = quoteAddress
      expect(mocks.notesJoinService.getCurrentBalanceNote).toHaveBeenCalledWith(ctx, '0xBaseAsset')
    })

    it('should throw when asset pair not found', async () => {
      mocks.dbService.getAssetPairById.mockResolvedValue(null)

      await expect(
        service.createOrder(makeOrderDto(), ctx as any)
      ).rejects.toThrow('Asset pair not found')
    })

    it('should throw when price validation fails', async () => {
      checkPrice.mockReturnValue(false)

      await expect(
        service.createOrder(makeOrderDto(), ctx as any)
      ).rejects.toThrow('Price not match with amountOut and amountIn')
    })

    it('should throw when insufficient balance', async () => {
      mocks.notesJoinService.getCurrentBalanceNote.mockResolvedValue({
        ...currentBalance,
        amount: BigInt(100) // less than amountOut 500
      })

      await expect(
        service.createOrder(makeOrderDto(), ctx as any)
      ).rejects.toThrow('Insufficient Asset')
    })

    it('should throw when transaction fails', async () => {
      ctx.darkSwap.provider.waitForTransaction.mockResolvedValue({ status: 0 })

      await expect(
        service.createOrder(makeOrderDto(), ctx as any)
      ).rejects.toThrow('Order creation failed')
    })

    it('should set status NOT_TRIGGERED for STOP_LOSS_LIMIT order', async () => {
      const dto = makeOrderDto({ orderType: OrderType.STOP_LOSS_LIMIT })

      await service.createOrder(dto, ctx as any)

      expect(mocks.orderEventService.logOrderStatusChange).toHaveBeenCalledWith(
        expect.any(String), expect.any(String), expect.any(Number), OrderStatus.NOT_TRIGGERED
      )
    })

    it('should set status NOT_TRIGGERED for STOP_LOSS order', async () => {
      const dto = makeOrderDto({ orderType: OrderType.STOP_LOSS })

      await service.createOrder(dto, ctx as any)

      const addOrderCall = mocks.dbService.addOrderByDto.mock.calls[0][0]
      expect(addOrderCall.status).toBe(OrderStatus.NOT_TRIGGERED)
    })

    it('should set status NOT_TRIGGERED for TAKE_PROFIT order', async () => {
      const dto = makeOrderDto({ orderType: OrderType.TAKE_PROFIT })

      await service.createOrder(dto, ctx as any)

      const addOrderCall = mocks.dbService.addOrderByDto.mock.calls[0][0]
      expect(addOrderCall.status).toBe(OrderStatus.NOT_TRIGGERED)
    })

    it('should set status NOT_TRIGGERED for TAKE_PROFIT_LIMIT order', async () => {
      const dto = makeOrderDto({ orderType: OrderType.TAKE_PROFIT_LIMIT })

      await service.createOrder(dto, ctx as any)

      const addOrderCall = mocks.dbService.addOrderByDto.mock.calls[0][0]
      expect(addOrderCall.status).toBe(OrderStatus.NOT_TRIGGERED)
    })

    it('should set status OPEN for LIMIT order', async () => {
      const dto = makeOrderDto({ orderType: OrderType.LIMIT })

      await service.createOrder(dto, ctx as any)

      const addOrderCall = mocks.dbService.addOrderByDto.mock.calls[0][0]
      expect(addOrderCall.status).toBe(OrderStatus.OPEN)
    })

    it('should set status OPEN for MARKET order', async () => {
      const dto = makeOrderDto({ orderType: OrderType.MARKET })

      await service.createOrder(dto, ctx as any)

      const addOrderCall = mocks.dbService.addOrderByDto.mock.calls[0][0]
      expect(addOrderCall.status).toBe(OrderStatus.OPEN)
    })

    it('should add newBalance note when amount > 0', async () => {
      await service.createOrder(makeOrderDto(), ctx as any)

      expect(mocks.noteService.addNote).toHaveBeenCalledWith(orderNote, ctx, true)
      expect(mocks.noteService.addNote).toHaveBeenCalledWith(newBalance, ctx, false)
      expect(mocks.noteService.setNoteActive).toHaveBeenCalledWith(newBalance, ctx, '0xCreateTx')
    })

    it('should NOT add newBalance note when amount is 0', async () => {
      mockProCreatePrepare.mockResolvedValue({
        context: 'create-context',
        orderNote,
        newBalance: { ...newBalance, amount: BigInt(0) }
      })

      await service.createOrder(makeOrderDto(), ctx as any)

      // addNote called once for orderNote, not for newBalance
      expect(mocks.noteService.addNote).toHaveBeenCalledTimes(1)
      expect(mocks.noteService.addNote).toHaveBeenCalledWith(orderNote, ctx, true)
    })

    it('should auto-generate orderId when not provided', async () => {
      const dto = makeOrderDto({ orderId: '' })

      await service.createOrder(dto, ctx as any)

      expect(dto.orderId).toBe('auto-generated-id')
    })

    it('should delete noteCommitment before calling bookNodeService.createOrder', async () => {
      const dto = makeOrderDto()

      await service.createOrder(dto, ctx as any)

      // The dto passed to bookNodeService.createOrder should NOT have noteCommitment
      const bookNodeCall = mocks.bookNodeService.createOrder.mock.calls[0][0]
      expect(bookNodeCall.noteCommitment).toBeUndefined()
    })

    it('should set nullifier, feeRatio, txHashCreated, publicKey on orderDto', async () => {
      const dto = makeOrderDto()

      // Capture the dto at the time addOrderByDto is called
      let capturedDto: any
      mocks.dbService.addOrderByDto.mockImplementation((d: any) => {
        capturedDto = { ...d }
        return Promise.resolve()
      })

      await service.createOrder(dto, ctx as any)

      expect(capturedDto.noteCommitment).toBe(orderNote.note.toString())
      expect(capturedDto.nullifier).toBe(orderNote.nullifier.toString())
      expect(capturedDto.feeRatio).toBe(orderNote.feeRatio.toString())
      expect(capturedDto.txHashCreated).toBe('0xCreateTx')
      expect(capturedDto.publicKey).toBe('0xPubKey')
    })

    it('should pass correct price check args for BUY direction', async () => {
      const dto = makeOrderDto({ orderDirection: OrderDirection.BUY })

      await service.createOrder(dto, ctx as any)

      // BUY: amountQuote = amountOut, amountBase = amountIn
      expect(checkPrice).toHaveBeenCalledWith(
        BigInt(1000), // amountBase = amountIn for BUY
        BigInt(500),  // amountQuote = amountOut for BUY
        18, 18, 2.0
      )
    })

    it('should pass correct price check args for SELL direction', async () => {
      const dto = makeOrderDto({ orderDirection: OrderDirection.SELL })

      await service.createOrder(dto, ctx as any)

      // SELL: amountQuote = amountIn, amountBase = amountOut
      expect(checkPrice).toHaveBeenCalledWith(
        BigInt(500),  // amountBase = amountOut for SELL
        BigInt(1000), // amountQuote = amountIn for SELL
        18, 18, 2.0
      )
    })
  })

  // =========================================================
  // cancelOrder
  // =========================================================
  describe('cancelOrder', () => {
    const mockNote = {
      note: BigInt(100),
      rho: BigInt(200),
      asset: '0xAssetA',
      amount: BigInt(500),
      wallet: '0xTestWallet'
    }

    const currentBalance = {
      note: BigInt(50),
      rho: BigInt(10),
      asset: '0xAssetA',
      amount: BigInt(300),
      address: '0xTestWallet'
    }

    const newBalance = {
      note: BigInt(600),
      rho: BigInt(700),
      asset: '0xAssetA',
      amount: BigInt(800)
    }

    beforeEach(() => {
      mocks.dbService.getOrderByOrderId.mockResolvedValue(
        makeOrderDto({ status: OrderStatus.OPEN, feeRatio: '100', noteCommitment: 'note-commit' })
      )
      mocks.dbService.getNoteByCommitment.mockReturnValue(mockNote)
      mocks.notesJoinService.getCurrentBalanceNote.mockResolvedValue(currentBalance)
      mockProCancelPrepare.mockResolvedValue({
        context: 'cancel-context',
        newBalance
      })
      mockProCancelExecute.mockResolvedValue('0xCancelTx')
    })

    it('should cancel an OPEN order successfully', async () => {
      await service.cancelOrder('order-1', ctx as any)

      expect(mockProCancelPrepare).toHaveBeenCalledWith(
        '0xTestWallet',
        expect.objectContaining({ note: BigInt(100), feeRatio: BigInt(100) }),
        currentBalance,
        '0xSignature',
        ctx.noteCryptoContext
      )
      expect(mockProCancelExecute).toHaveBeenCalledWith('cancel-context')
      expect(mocks.noteService.addNote).toHaveBeenCalledWith(newBalance, ctx, false)
      expect(mocks.noteService.setNoteActive).toHaveBeenCalledWith(newBalance, ctx, '0xCancelTx')
      expect(mocks.dbService.cancelOrder).toHaveBeenCalledWith('order-1')
      expect(mocks.orderEventService.logOrderStatusChange).toHaveBeenCalledWith(
        'order-1', '0xTestWallet', 1, OrderStatus.CANCELLED
      )
    })

    it('should cancel a NOT_TRIGGERED order successfully', async () => {
      mocks.dbService.getOrderByOrderId.mockResolvedValue(
        makeOrderDto({ status: OrderStatus.NOT_TRIGGERED, feeRatio: '100', noteCommitment: 'note-commit' })
      )

      await service.cancelOrder('order-1', ctx as any)

      expect(mocks.dbService.cancelOrder).toHaveBeenCalledWith('order-1')
    })

    it('should throw when order not found', async () => {
      mocks.dbService.getOrderByOrderId.mockResolvedValue(null)

      await expect(
        service.cancelOrder('order-1', ctx as any)
      ).rejects.toThrow('Order not found')
    })

    it('should throw when order is MATCHED (not cancellable)', async () => {
      mocks.dbService.getOrderByOrderId.mockResolvedValue(
        makeOrderDto({ status: OrderStatus.MATCHED })
      )

      await expect(
        service.cancelOrder('order-1', ctx as any)
      ).rejects.toThrow('Order is not cancellable')
    })

    it('should throw when order is SETTLED (not cancellable)', async () => {
      mocks.dbService.getOrderByOrderId.mockResolvedValue(
        makeOrderDto({ status: OrderStatus.SETTLED })
      )

      await expect(
        service.cancelOrder('order-1', ctx as any)
      ).rejects.toThrow('Order is not cancellable')
    })

    it('should throw when order is CANCELLED (not cancellable)', async () => {
      mocks.dbService.getOrderByOrderId.mockResolvedValue(
        makeOrderDto({ status: OrderStatus.CANCELLED })
      )

      await expect(
        service.cancelOrder('order-1', ctx as any)
      ).rejects.toThrow('Order is not cancellable')
    })

    it('should throw when note not found', async () => {
      mocks.dbService.getNoteByCommitment.mockReturnValue(null)

      await expect(
        service.cancelOrder('order-1', ctx as any)
      ).rejects.toThrow('Note not found')
    })

    it('should throw when cancel transaction fails', async () => {
      ctx.darkSwap.provider.waitForTransaction.mockResolvedValue({ status: 0 })

      await expect(
        service.cancelOrder('order-1', ctx as any)
      ).rejects.toThrow('Order cancellation failed')
    })

    it('should call bookNodeService.cancelOrder when byNotification is false', async () => {
      await service.cancelOrder('order-1', ctx as any, false)

      expect(mocks.bookNodeService.cancelOrder).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'order-1' })
      )
    })

    it('should NOT call bookNodeService.cancelOrder when byNotification is true', async () => {
      await service.cancelOrder('order-1', ctx as any, true)

      expect(mocks.bookNodeService.cancelOrder).not.toHaveBeenCalled()
    })

    it('should mark both order note and current balance as used', async () => {
      await service.cancelOrder('order-1', ctx as any)

      expect(mocks.noteService.setNoteUsed).toHaveBeenCalledTimes(2)
    })
  })

  // =========================================================
  // cancelOrderByNotificaion
  // =========================================================
  describe('cancelOrderByNotificaion', () => {
    it('should create context and call cancelOrder with byNotification=true', async () => {
      const orderInfo = makeOrderDto({ orderId: 'order-2', chainId: 1, wallet: '0xWallet' })
      const mockCtx = makeDarkSwapContext()
      mockCreateDarkSwapContext.mockResolvedValue(mockCtx)

      // Setup mocks for cancelOrder
      mocks.dbService.getOrderByOrderId.mockResolvedValue(
        makeOrderDto({ status: OrderStatus.OPEN, feeRatio: '100', noteCommitment: 'commit' })
      )
      mocks.dbService.getNoteByCommitment.mockReturnValue({
        note: BigInt(100), rho: BigInt(200), asset: '0xA', amount: BigInt(500), wallet: '0xW'
      })
      mocks.notesJoinService.getCurrentBalanceNote.mockResolvedValue({
        note: BigInt(50), rho: BigInt(10), asset: '0xA', amount: BigInt(300), address: '0xW'
      })
      mockProCancelPrepare.mockResolvedValue({
        context: 'ctx',
        newBalance: { note: BigInt(600), rho: BigInt(700), asset: '0xA', amount: BigInt(800) }
      })
      mockProCancelExecute.mockResolvedValue('0xTx')
      mockCtx.darkSwap.provider.waitForTransaction.mockResolvedValue({ status: 1 })

      await service.cancelOrderByNotificaion(orderInfo)

      expect(mockCreateDarkSwapContext).toHaveBeenCalledWith(1, '0xWallet', mocks.rpcManager)
      // byNotification=true means bookNodeService.cancelOrder should NOT be called
      expect(mocks.bookNodeService.cancelOrder).not.toHaveBeenCalled()
    })
  })

  // =========================================================
  // triggerOrder
  // =========================================================
  describe('triggerOrder', () => {
    it('should update order status to TRIGGERED', async () => {
      const orderInfo = makeOrderDto()

      await service.triggerOrder(orderInfo)

      expect(mocks.dbService.updateOrderTriggered).toHaveBeenCalledWith('order-1')
      expect(mocks.orderEventService.logOrderStatusChange).toHaveBeenCalledWith(
        'order-1', '0xTestWallet', 1, OrderStatus.TRIGGERED
      )
    })

    it('should throw when orderInfo is null', async () => {
      await expect(
        service.triggerOrder(null as any)
      ).rejects.toThrow('Order not found')
    })
  })
})
