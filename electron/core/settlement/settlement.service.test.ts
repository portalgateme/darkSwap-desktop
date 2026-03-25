import { DarkSwapError, NoteOnChainStatus } from '@thesingularitynetwork/darkswap-sdk'
import { SettlementService } from './settlement.service'
import { OrderDirection, OrderDto, OrderStatus, NoteDto } from '../types'

// --- SDK mocks ---
const mockCalcNullifier = jest.fn().mockReturnValue(BigInt(999))
const mockIsAddressEquals = jest.fn()
const mockDeserializeDarkSwapMessage = jest.fn()
const mockDeserializeDarkSwapMarketMessage = jest.fn()
const mockDeserializeDarkSwapBobMarketMessage = jest.fn()
const mockGetNoteOnChainStatusByPublicKey = jest.fn()
const mockGetNoteOnChainStatusBySignature = jest.fn()
const mockHexlify32 = jest.fn().mockReturnValue('0xnullifier')
const mockSerializeDarkSwapMessage = jest.fn().mockReturnValue('serialized-msg')
const mockSerializeDarkSwapBobMarketMessage = jest.fn().mockReturnValue('serialized-market-msg')

const mockProSwapPrepare = jest.fn()
const mockProSwapExecute = jest.fn()
const mockProMarketSwapPrepare = jest.fn()
const mockProMarketSwapExecute = jest.fn()
const mockPrepareProSwapMessageForBob = jest.fn()
const mockPrepareProMarketSwapMessageForBob = jest.fn()

jest.mock('@thesingularitynetwork/darkswap-sdk', () => ({
  calcNullifier: (...args: any[]) => mockCalcNullifier(...args),
  DarkSwapError: class DarkSwapError extends Error {
    constructor(msg: string) { super(msg); this.name = 'DarkSwapError' }
  },
  isAddressEquals: (...args: any[]) => mockIsAddressEquals(...args),
  NoteOnChainStatus: { ACTIVE: 0, SPENT: 1, NOT_FOUND: 2 }
}))

jest.mock('@thesingularitynetwork/darkswap-sdk', () => ({
  calcNullifier: (...args: any[]) => mockCalcNullifier(...args),
  DarkSwapError: class DarkSwapError extends Error {
    constructor(msg: string) { super(msg); this.name = 'DarkSwapError' }
  },
  isAddressEquals: (...args: any[]) => mockIsAddressEquals(...args),
  NoteOnChainStatus: { ACTIVE: 0, SPENT: 1, NOT_FOUND: 2 },
  deserializeDarkSwapMessage: (...args: any[]) => mockDeserializeDarkSwapMessage(...args),
  deserializeDarkSwapMarketMessage: (...args: any[]) => mockDeserializeDarkSwapMarketMessage(...args),
  deserializeDarkSwapBobMarketMessage: (...args: any[]) => mockDeserializeDarkSwapBobMarketMessage(...args),
  getNoteOnChainStatusByPublicKey: (...args: any[]) => mockGetNoteOnChainStatusByPublicKey(...args),
  getNoteOnChainStatusBySignature: (...args: any[]) => mockGetNoteOnChainStatusBySignature(...args),
  hexlify32: (...args: any[]) => mockHexlify32(...args),
  ProSwapService: jest.fn().mockImplementation(() => ({
    prepare: mockProSwapPrepare,
    execute: mockProSwapExecute
  })),
  ProMarketSwapService: jest.fn().mockImplementation(() => ({
    prepare: mockProMarketSwapPrepare,
    execute: mockProMarketSwapExecute
  })),
  serializeDarkSwapMessage: (...args: any[]) => mockSerializeDarkSwapMessage(...args),
  serializeDarkSwapBobMarketMessage: (...args: any[]) => mockSerializeDarkSwapBobMarketMessage(...args)
}))

// Add static methods after mock
const sdk = jest.requireMock('@thesingularitynetwork/darkswap-sdk')
sdk.ProSwapService.prepareProSwapMessageForBob = mockPrepareProSwapMessageForBob
sdk.ProMarketSwapService.prepareProMarketSwapMessageForBob = mockPrepareProMarketSwapMessageForBob

// --- DarkSwapContext mock ---
const mockWaitForTransaction = jest.fn()
const mockDarkSwapContext = {
  chainId: 1,
  walletAddress: '0xAliceWallet',
  signer: {},
  publicKey: '0xPubKey',
  darkSwap: { provider: { waitForTransaction: mockWaitForTransaction } },
  signature: '0xSignature',
  noteCryptoContext: {}
}

const mockCreateDarkSwapContext = jest.fn().mockResolvedValue(mockDarkSwapContext)
jest.mock('../common/context/darkSwap.context', () => ({
  DarkSwapContext: {
    createDarkSwapContext: (...args: any[]) => mockCreateDarkSwapContext(...args)
  }
}))

jest.mock('../config/networkConfig', () => ({
  getConfirmations: jest.fn().mockReturnValue(3)
}))

// --- Helper factories ---
function makeOrderDto(overrides: Partial<OrderDto> = {}): OrderDto {
  const dto = new OrderDto()
  dto.orderId = 'order-1'
  dto.chainId = 1
  dto.wallet = '0xAliceWallet'
  dto.assetPairId = 'pair-1'
  dto.orderDirection = OrderDirection.BUY
  dto.noteCommitment = 'note-commit-1'
  dto.nullifier = '0xAliceNullifier'
  dto.feeRatio = '100'
  dto.amountIn = '1000'
  dto.amountOut = '500'
  dto.price = '2.0'
  dto.status = OrderStatus.OPEN
  return Object.assign(dto, overrides)
}

function makeNoteDto(overrides: Partial<NoteDto> = {}): NoteDto {
  return {
    id: 1,
    chainId: 1,
    wallet: '0xAliceWallet',
    publicKey: '0xPubKey',
    type: 0,
    note: BigInt(123),
    rho: BigInt(456),
    asset: '0xAssetA',
    amount: BigInt(1000),
    status: 1,
    txHashCreated: '0xTxHash'
  } as NoteDto
}

// --- Mock services ---
function createMockServices() {
  const dbService = {
    getNoteByCommitment: jest.fn().mockReturnValue(makeNoteDto()),
    updateOrderIncomingNoteCommitment: jest.fn(),
    updateOrderSettlementTransaction: jest.fn().mockResolvedValue(undefined),
    updateOrderMatched: jest.fn().mockResolvedValue(undefined),
    getAssetPairById: jest.fn().mockResolvedValue({
      id: 'pair-1',
      chainId: 1,
      baseAddress: '0xBaseAsset',
      baseSymbol: 'BASE',
      baseDecimal: 18,
      quoteAddress: '0xAssetA',
      quoteSymbol: 'QUOTE',
      quoteDecimal: 18
    }),
    updateNoteSpentByWalletAndNoteCommitment: jest.fn(),
    updateNoteTransactionByWalletAndNoteCommitment: jest.fn()
  }

  const booknodeService = {
    getMatchedOrderDetails: jest.fn(),
    settleOrder: jest.fn().mockResolvedValue(undefined),
    confirmOrder: jest.fn().mockResolvedValue(undefined),
    bobPostSettlement: jest.fn().mockResolvedValue(undefined)
  }

  const noteService = {
    addNote: jest.fn(),
    addNotes: jest.fn(),
    setNoteUsed: jest.fn(),
    setNoteActive: jest.fn().mockResolvedValue(undefined),
    setNotesActive: jest.fn().mockResolvedValue(undefined)
  }

  const noteJoinService = {
    getCurrentBalanceNote: jest.fn().mockResolvedValue(null)
  }

  const orderEventService = {
    logOrderStatusChange: jest.fn().mockResolvedValue(undefined)
  }

  const subgraphService = {
    getSwapTxByNullifiers: jest.fn()
  }

  const rpcManager = {}

  return {
    dbService,
    booknodeService,
    noteService,
    noteJoinService,
    orderEventService,
    subgraphService,
    rpcManager
  }
}

describe('SettlementService', () => {
  let service: SettlementService
  let mocks: ReturnType<typeof createMockServices>

  beforeEach(() => {
    jest.clearAllMocks()
    mocks = createMockServices()
    service = new SettlementService(
      mocks.dbService as any,
      mocks.booknodeService as any,
      mocks.noteService as any,
      mocks.noteJoinService as any,
      mocks.orderEventService as any,
      mocks.subgraphService as any,
      mocks.rpcManager as any
    )
  })

  // =========================================================
  // aliceSwap — market order (isMarket = true)
  // =========================================================
  describe('aliceSwap - market order', () => {
    const marketMatchedOrder = {
      orderId: 'order-1',
      chainId: 1,
      isMarket: true,
      bobSwapMessage: 'encoded-market-msg'
    }

    const bobMarketMessage = {
      bobOrderNote: { rho: BigInt(789) },
      bobPublicKey: '0xBobPubKey',
      mcWalletAddress: '0xMcWallet'
    }

    beforeEach(() => {
      mocks.booknodeService.getMatchedOrderDetails.mockResolvedValue(marketMatchedOrder)
      mockDeserializeDarkSwapMarketMessage.mockReturnValue(bobMarketMessage)
      mockGetNoteOnChainStatusBySignature.mockResolvedValue(0) // ACTIVE
    })

    it('should execute ProMarketSwapService.prepare and execute when note is active', async () => {
      const swapInNote = { note: BigInt(10), rho: BigInt(11), asset: '0xAssetA', amount: BigInt(500), address: '0xAlice' }
      const changeNote = { note: BigInt(20), rho: BigInt(21), asset: '0xAssetA', amount: BigInt(0), address: '0xAlice' }

      mockProMarketSwapPrepare.mockResolvedValue({
        context: 'market-context',
        swapInNote,
        changeNote
      })
      mockProMarketSwapExecute.mockResolvedValue('0xMarketTxHash')
      mockWaitForTransaction.mockResolvedValue({ status: 1 })

      await service.aliceSwap(makeOrderDto())

      expect(mockDeserializeDarkSwapMarketMessage).toHaveBeenCalledWith('encoded-market-msg')
      expect(mockProMarketSwapPrepare).toHaveBeenCalledWith(
        '0xAliceWallet',
        expect.objectContaining({ feeRatio: BigInt(100) }),
        '0xMcWallet',
        bobMarketMessage,
        '0xSignature',
        mockDarkSwapContext.noteCryptoContext
      )
      expect(mockProMarketSwapExecute).toHaveBeenCalledWith('market-context')
      // changeNote.amount is 0n, so only swapInNote should be added
      expect(mocks.noteService.addNotes).toHaveBeenCalledWith([swapInNote], mockDarkSwapContext, false)
      expect(mocks.dbService.updateOrderIncomingNoteCommitment).toHaveBeenCalledWith('order-1', swapInNote.note)
      expect(mocks.dbService.updateOrderSettlementTransaction).toHaveBeenCalledWith('order-1', '0xMarketTxHash')
      expect(mocks.booknodeService.settleOrder).toHaveBeenCalled()
      expect(mocks.orderEventService.logOrderStatusChange).toHaveBeenCalledWith(
        'order-1', '0xAliceWallet', 1, OrderStatus.SETTLED
      )
    })

    it('should include changeNote when amount is non-zero', async () => {
      const swapInNote = { note: BigInt(10), rho: BigInt(11), asset: '0xAssetA', amount: BigInt(500), address: '0xAlice' }
      const changeNote = { note: BigInt(20), rho: BigInt(21), asset: '0xAssetA', amount: BigInt(200), address: '0xAlice' }

      mockProMarketSwapPrepare.mockResolvedValue({
        context: 'market-context',
        swapInNote,
        changeNote
      })
      mockProMarketSwapExecute.mockResolvedValue('0xMarketTxHash')
      mockWaitForTransaction.mockResolvedValue({ status: 1 })

      await service.aliceSwap(makeOrderDto())

      expect(mocks.noteService.addNotes).toHaveBeenCalledWith(
        [swapInNote, changeNote],
        mockDarkSwapContext,
        false
      )
    })

    it('should throw when market swap tx fails', async () => {
      mockProMarketSwapPrepare.mockResolvedValue({
        context: 'market-context',
        swapInNote: { note: BigInt(10), rho: BigInt(11), asset: '0xA', amount: BigInt(500), address: '0x' },
        changeNote: { note: BigInt(20), rho: BigInt(21), asset: '0xA', amount: BigInt(0), address: '0x' }
      })
      mockProMarketSwapExecute.mockResolvedValue('0xFailedTx')
      mockWaitForTransaction.mockResolvedValue({ status: 0 })

      await expect(service.aliceSwap(makeOrderDto())).rejects.toThrow('pro market swap failed')
    })

    it('should recover from subgraph when alice note is not active (market)', async () => {
      mockGetNoteOnChainStatusBySignature.mockResolvedValue(1) // SPENT
      mocks.subgraphService.getSwapTxByNullifiers.mockResolvedValue({
        txHash: '0xRecoveryTx',
        aliceInNote: '100',
        aliceChangeNote: '0'
      })
      mocks.dbService.getNoteByCommitment
        .mockReturnValueOnce(makeNoteDto()) // orderNote
        .mockReturnValueOnce(makeNoteDto({ note: BigInt(100) })) // incomingNote

      await service.aliceSwap(makeOrderDto())

      expect(mocks.subgraphService.getSwapTxByNullifiers).toHaveBeenCalledWith(
        1, '0xAliceNullifier', '0xnullifier'
      )
      expect(mocks.dbService.updateOrderSettlementTransaction).toHaveBeenCalledWith('order-1', '0xRecoveryTx')
    })

    it('should recover with changeNote when aliceChangeNote is non-zero (market)', async () => {
      mockGetNoteOnChainStatusBySignature.mockResolvedValue(1)
      mocks.subgraphService.getSwapTxByNullifiers.mockResolvedValue({
        txHash: '0xRecoveryTx',
        aliceInNote: '100',
        aliceChangeNote: '200'
      })
      mocks.dbService.getNoteByCommitment
        .mockReturnValueOnce(makeNoteDto()) // orderNote
        .mockReturnValueOnce(makeNoteDto({ note: BigInt(100) })) // incomingNote
        .mockReturnValueOnce(makeNoteDto({ note: BigInt(200) })) // changeNote

      await service.aliceSwap(makeOrderDto())

      // setNoteActive should be called for both notes
      expect(mocks.noteService.setNoteActive).toHaveBeenCalledTimes(2)
    })

    it('should throw when note not active and no subgraph recovery (market)', async () => {
      mockGetNoteOnChainStatusBySignature.mockResolvedValue(1)
      mocks.subgraphService.getSwapTxByNullifiers.mockResolvedValue(null)

      await expect(service.aliceSwap(makeOrderDto())).rejects.toThrow(
        'is not active and no settlement transaction found'
      )
    })
  })

  // =========================================================
  // aliceSwap — limit order (isMarket = false)
  // =========================================================
  describe('aliceSwap - limit order', () => {
    const limitMatchedOrder = {
      orderId: 'order-1',
      chainId: 1,
      isMarket: false,
      bobSwapMessage: 'encoded-limit-msg'
    }

    const bobSwapMessage = {
      orderNote: { rho: BigInt(789) },
      publicKey: '0xBobPubKey',
      address: '0xBobAddress',
      inNote: { note: BigInt(50) }
    }

    beforeEach(() => {
      mocks.booknodeService.getMatchedOrderDetails.mockResolvedValue(limitMatchedOrder)
      mockDeserializeDarkSwapMessage.mockReturnValue(bobSwapMessage)
      mockGetNoteOnChainStatusBySignature.mockResolvedValue(0) // ACTIVE
      mockGetNoteOnChainStatusByPublicKey.mockResolvedValue(0) // ACTIVE
    })

    it('should execute ProSwapService.prepare and execute when note is active', async () => {
      const swapInNote = { note: BigInt(10), rho: BigInt(11), asset: '0xAssetA', amount: BigInt(500), address: '0xAlice' }
      const changeNote = { note: BigInt(20), rho: BigInt(21), asset: '0xAssetA', amount: BigInt(0), address: '0xAlice' }

      mockProSwapPrepare.mockResolvedValue({
        context: 'limit-context',
        swapInNote,
        changeNote
      })
      mockProSwapExecute.mockResolvedValue('0xLimitTxHash')
      mockWaitForTransaction.mockResolvedValue({ status: 1 })

      await service.aliceSwap(makeOrderDto())

      expect(mockDeserializeDarkSwapMessage).toHaveBeenCalledWith('encoded-limit-msg')
      expect(mockGetNoteOnChainStatusByPublicKey).toHaveBeenCalled()
      expect(mockProSwapPrepare).toHaveBeenCalledWith(
        '0xAliceWallet',
        expect.objectContaining({ feeRatio: BigInt(100) }),
        '0xBobAddress',
        bobSwapMessage,
        '0xSignature',
        mockDarkSwapContext.noteCryptoContext
      )
      expect(mockProSwapExecute).toHaveBeenCalledWith('limit-context')
      expect(mocks.noteService.addNotes).toHaveBeenCalledWith([swapInNote], mockDarkSwapContext, false)
    })

    it('should throw when limit swap tx fails', async () => {
      mockProSwapPrepare.mockResolvedValue({
        context: 'limit-context',
        swapInNote: { note: BigInt(10), rho: BigInt(11), asset: '0xA', amount: BigInt(500), address: '0x' },
        changeNote: { note: BigInt(20), rho: BigInt(21), asset: '0xA', amount: BigInt(0), address: '0x' }
      })
      mockProSwapExecute.mockResolvedValue('0xFailedTx')
      mockWaitForTransaction.mockResolvedValue({ status: 0 })

      await expect(service.aliceSwap(makeOrderDto())).rejects.toThrow('pro swap failed')
    })

    it('should check bob note status for limit orders', async () => {
      const swapInNote = { note: BigInt(10), rho: BigInt(11), asset: '0xA', amount: BigInt(500), address: '0x' }
      const changeNote = { note: BigInt(20), rho: BigInt(21), asset: '0xA', amount: BigInt(0), address: '0x' }

      mockProSwapPrepare.mockResolvedValue({ context: 'ctx', swapInNote, changeNote })
      mockProSwapExecute.mockResolvedValue('0xTx')
      mockWaitForTransaction.mockResolvedValue({ status: 1 })

      await service.aliceSwap(makeOrderDto())

      expect(mockGetNoteOnChainStatusByPublicKey).toHaveBeenCalledWith(
        mockDarkSwapContext.darkSwap,
        bobSwapMessage.orderNote,
        bobSwapMessage.publicKey
      )
    })

    it('should throw when bob note is not active for limit orders', async () => {
      mockGetNoteOnChainStatusByPublicKey.mockResolvedValue(1) // NOT ACTIVE

      await expect(service.aliceSwap(makeOrderDto())).rejects.toThrow(
        "counter party's note is not valid"
      )
    })

    it('should recover from subgraph when alice note is not active (limit)', async () => {
      mockGetNoteOnChainStatusBySignature.mockResolvedValue(1) // SPENT
      mocks.subgraphService.getSwapTxByNullifiers.mockResolvedValue({
        txHash: '0xRecoveryTx',
        aliceInNote: '100',
        aliceChangeNote: '0'
      })
      mocks.dbService.getNoteByCommitment
        .mockReturnValueOnce(makeNoteDto())
        .mockReturnValueOnce(makeNoteDto({ note: BigInt(100) }))

      await service.aliceSwap(makeOrderDto())

      expect(mocks.dbService.updateOrderSettlementTransaction).toHaveBeenCalledWith('order-1', '0xRecoveryTx')
    })
  })

  // =========================================================
  // bobPostSettlement
  // =========================================================
  describe('bobPostSettlement', () => {
    it('should handle market order with inPartialNote', async () => {
      mocks.booknodeService.getMatchedOrderDetails.mockResolvedValue({
        isMarket: true,
        bobSwapMessage: 'bob-market-msg'
      })
      mockDeserializeDarkSwapBobMarketMessage.mockReturnValue({
        inPartialNote: { rho: BigInt(999) }
      })
      mocks.dbService.getNoteByCommitment
        .mockReturnValueOnce(makeNoteDto()) // outgoingNote
        .mockReturnValueOnce(makeNoteDto({ note: BigInt(999), asset: '0xAssetB' })) // incomingNote

      await service.bobPostSettlement(makeOrderDto(), '0xSettleTx')

      expect(mockDeserializeDarkSwapBobMarketMessage).toHaveBeenCalledWith('bob-market-msg')
      expect(mocks.noteService.setNoteActive).toHaveBeenCalled()
      expect(mocks.noteJoinService.getCurrentBalanceNote).toHaveBeenCalled()
      expect(mocks.booknodeService.bobPostSettlement).toHaveBeenCalledWith({
        orderId: 'order-1',
        wallet: '0xAliceWallet',
        chainId: 1
      })
    })

    it('should handle market order without inPartialNote', async () => {
      mocks.booknodeService.getMatchedOrderDetails.mockResolvedValue({
        isMarket: true,
        bobSwapMessage: 'bob-market-msg'
      })
      mockDeserializeDarkSwapBobMarketMessage.mockReturnValue({
        inPartialNote: null
      })

      await service.bobPostSettlement(makeOrderDto(), '0xSettleTx')

      expect(mocks.noteService.setNoteActive).not.toHaveBeenCalled()
      expect(mocks.booknodeService.bobPostSettlement).toHaveBeenCalled()
    })

    it('should handle limit order with inNote', async () => {
      mocks.booknodeService.getMatchedOrderDetails.mockResolvedValue({
        isMarket: false,
        bobSwapMessage: 'bob-limit-msg'
      })
      mockDeserializeDarkSwapMessage.mockReturnValue({
        inNote: { note: BigInt(777) }
      })
      mocks.dbService.getNoteByCommitment
        .mockReturnValueOnce(makeNoteDto()) // outgoingNote
        .mockReturnValueOnce(makeNoteDto({ note: BigInt(777), asset: '0xAssetC' })) // incomingNote

      await service.bobPostSettlement(makeOrderDto(), '0xSettleTx')

      expect(mockDeserializeDarkSwapMessage).toHaveBeenCalledWith('bob-limit-msg')
      expect(mocks.noteService.setNoteActive).toHaveBeenCalled()
      expect(mocks.noteJoinService.getCurrentBalanceNote).toHaveBeenCalled()
    })

    it('should handle limit order without inNote', async () => {
      mocks.booknodeService.getMatchedOrderDetails.mockResolvedValue({
        isMarket: false,
        bobSwapMessage: 'bob-limit-msg'
      })
      mockDeserializeDarkSwapMessage.mockReturnValue({
        inNote: null
      })

      await service.bobPostSettlement(makeOrderDto(), '0xSettleTx')

      expect(mocks.noteService.setNoteActive).not.toHaveBeenCalled()
    })

    it('should mark outgoing note as used and update settlement tx', async () => {
      mocks.booknodeService.getMatchedOrderDetails.mockResolvedValue({
        isMarket: false,
        bobSwapMessage: 'msg'
      })
      mockDeserializeDarkSwapMessage.mockReturnValue({ inNote: null })

      await service.bobPostSettlement(makeOrderDto(), '0xSettleTx')

      expect(mocks.noteService.setNoteUsed).toHaveBeenCalled()
      expect(mocks.dbService.updateOrderSettlementTransaction).toHaveBeenCalledWith('order-1', '0xSettleTx')
      expect(mocks.orderEventService.logOrderStatusChange).toHaveBeenCalledWith(
        'order-1', '0xAliceWallet', 1, OrderStatus.SETTLED
      )
    })
  })

  // =========================================================
  // bobConfirm
  // =========================================================
  describe('bobConfirm', () => {
    it('should skip if bobSwapMessage already exists', async () => {
      mocks.booknodeService.getMatchedOrderDetails.mockResolvedValue({
        bobSwapMessage: 'already-confirmed'
      })

      await service.bobConfirm(makeOrderDto())

      expect(mocks.booknodeService.confirmOrder).not.toHaveBeenCalled()
    })

    it('should confirm market order via ProMarketSwapService', async () => {
      mocks.booknodeService.getMatchedOrderDetails.mockResolvedValue({
        bobSwapMessage: null,
        isMarket: true
      })
      mockIsAddressEquals.mockReturnValue(true) // orderNote.asset === quoteAddress
      const bobMarketMsg = { some: 'market-data' }
      mockPrepareProMarketSwapMessageForBob.mockResolvedValue(bobMarketMsg)

      await service.bobConfirm(makeOrderDto())

      expect(mockPrepareProMarketSwapMessageForBob).toHaveBeenCalledWith(
        '0xAliceWallet',
        expect.objectContaining({ feeRatio: BigInt(100) }),
        BigInt(1000),
        '0xBaseAsset', // swapInAsset when isAddressEquals returns true
        '0xSignature'
      )
      expect(mockSerializeDarkSwapBobMarketMessage).toHaveBeenCalledWith(bobMarketMsg)
      expect(mocks.booknodeService.confirmOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          swapMessage: 'serialized-market-msg'
        })
      )
      // Market order should NOT add note to noteService
      expect(mocks.noteService.addNote).not.toHaveBeenCalled()
    })

    it('should confirm limit order via ProSwapService', async () => {
      mocks.booknodeService.getMatchedOrderDetails.mockResolvedValue({
        bobSwapMessage: null,
        isMarket: false
      })
      mockIsAddressEquals.mockReturnValue(false) // orderNote.asset !== quoteAddress
      const darkSwapMessage = {
        inNote: { note: BigInt(888) }
      }
      mockPrepareProSwapMessageForBob.mockResolvedValue(darkSwapMessage)

      await service.bobConfirm(makeOrderDto())

      expect(mockPrepareProSwapMessageForBob).toHaveBeenCalledWith(
        '0xAliceWallet',
        expect.objectContaining({ feeRatio: BigInt(100) }),
        BigInt(1000),
        '0xAssetA', // swapInAsset = quoteAddress when isAddressEquals returns false
        '0xSignature'
      )
      expect(mocks.noteService.addNote).toHaveBeenCalledWith(
        darkSwapMessage.inNote,
        mockDarkSwapContext,
        false
      )
      expect(mocks.dbService.updateOrderIncomingNoteCommitment).toHaveBeenCalledWith(
        'order-1',
        darkSwapMessage.inNote.note
      )
      expect(mockSerializeDarkSwapMessage).toHaveBeenCalledWith(darkSwapMessage)
      expect(mocks.booknodeService.confirmOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          swapMessage: 'serialized-msg'
        })
      )
    })

    it('should log order status change after confirm', async () => {
      mocks.booknodeService.getMatchedOrderDetails.mockResolvedValue({
        bobSwapMessage: null,
        isMarket: false
      })
      mockIsAddressEquals.mockReturnValue(false)
      mockPrepareProSwapMessageForBob.mockResolvedValue({ inNote: { note: BigInt(1) } })

      await service.bobConfirm(makeOrderDto())

      expect(mocks.orderEventService.logOrderStatusChange).toHaveBeenCalledWith(
        'order-1', '0xAliceWallet', 1, OrderStatus.MATCHED
      )
    })
  })

  // =========================================================
  // matchedForAlice
  // =========================================================
  describe('matchedForAlice', () => {
    it('should update order to MATCHED when status is OPEN', async () => {
      const order = makeOrderDto({ status: OrderStatus.OPEN })

      await service.matchedForAlice(order)

      expect(mocks.orderEventService.logOrderStatusChange).toHaveBeenCalledWith(
        'order-1', '0xAliceWallet', 1, OrderStatus.MATCHED
      )
      expect(mocks.dbService.updateOrderMatched).toHaveBeenCalledWith('order-1')
    })

    it('should not update when order status is not OPEN', async () => {
      const order = makeOrderDto({ status: OrderStatus.MATCHED })

      await service.matchedForAlice(order)

      expect(mocks.orderEventService.logOrderStatusChange).not.toHaveBeenCalled()
      expect(mocks.dbService.updateOrderMatched).not.toHaveBeenCalled()
    })
  })
})
