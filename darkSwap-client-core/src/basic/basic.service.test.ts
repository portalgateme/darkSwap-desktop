import { BasicService } from './basic.service'

const mockPrepare = jest.fn()
const mockExecute = jest.fn()
const mockGetCurrentBalanceNote = jest.fn()

jest.mock('@thesingularitynetwork/darkswap-sdk', () => ({
  DarkSwapError: class DarkSwapError extends Error {
    constructor(msg: string) { super(msg); this.name = 'DarkSwapError' }
  },
  DepositService: jest.fn().mockImplementation(() => ({
    prepare: mockPrepare,
    execute: mockExecute
  })),
  WithdrawService: jest.fn().mockImplementation(() => ({
    prepare: mockPrepare,
    execute: mockExecute
  }))
}))

jest.mock('../config/networkConfig', () => ({
  getConfirmations: jest.fn().mockReturnValue(3)
}))

describe('BasicService', () => {
  let service: BasicService
  let mockDbService: any
  let mockNoteService: any
  let mockNotesJoinService: any

  const mockDarkSwapContext = {
    chainId: 8453,
    walletAddress: '0xTestWallet',
    signer: {},
    publicKey: '0xPubKey',
    darkSwap: {
      provider: {
        waitForTransaction: jest.fn().mockResolvedValue({ status: 1 })
      }
    },
    signature: '0xTestSignature',
    noteCryptoContext: { key: 'test-crypto-context' }
  }

  const mockBalanceNote = {
    note: BigInt(0),
    rho: BigInt(0),
    asset: '0xAsset',
    amount: BigInt(0),
    address: '0xTestWallet'
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockDbService = {
      updateNoteTransactionByWalletAndNoteCommitment: jest.fn()
    }
    mockNoteService = {
      addNote: jest.fn(),
      setNoteUsed: jest.fn(),
      setNoteActive: jest.fn()
    }
    mockNotesJoinService = {
      getCurrentBalanceNote: mockGetCurrentBalanceNote
    }

    mockGetCurrentBalanceNote.mockResolvedValue(mockBalanceNote)

    service = new BasicService(mockDbService, mockNoteService, mockNotesJoinService)
  })

  describe('deposit', () => {
    it('should pass noteCryptoContext as 6th argument to depositService.prepare', async () => {
      const newBalanceNote = {
        note: BigInt(100),
        rho: BigInt(200),
        asset: '0xAsset',
        amount: BigInt(1000),
        address: '0xTestWallet'
      }

      mockPrepare.mockResolvedValue({
        context: 'deposit-context',
        newBalanceNote
      })
      mockExecute.mockResolvedValue('0xTxHash')

      await service.deposit(
        mockDarkSwapContext as any,
        '0xAsset',
        BigInt(1000)
      )

      // Verify noteCryptoContext is passed as the 6th argument
      expect(mockPrepare).toHaveBeenCalledWith(
        mockBalanceNote,
        '0xAsset',
        BigInt(1000),
        '0xTestWallet',
        '0xTestSignature',
        mockDarkSwapContext.noteCryptoContext  // 6th argument - the fix
      )
    })

    it('should add the new balance note after prepare', async () => {
      const newBalanceNote = {
        note: BigInt(100),
        rho: BigInt(200),
        asset: '0xAsset',
        amount: BigInt(1000),
        address: '0xTestWallet'
      }

      mockPrepare.mockResolvedValue({
        context: 'deposit-context',
        newBalanceNote
      })
      mockExecute.mockResolvedValue('0xTxHash')

      await service.deposit(
        mockDarkSwapContext as any,
        '0xAsset',
        BigInt(1000)
      )

      expect(mockNoteService.addNote).toHaveBeenCalledWith(
        newBalanceNote,
        mockDarkSwapContext,
        false
      )
    })

    it('should throw when deposit transaction fails', async () => {
      mockPrepare.mockResolvedValue({
        context: 'deposit-context',
        newBalanceNote: { note: BigInt(1), rho: BigInt(2), asset: '0xA', amount: BigInt(100), address: '0x' }
      })
      mockExecute.mockResolvedValue('0xFailedTx')
      mockDarkSwapContext.darkSwap.provider.waitForTransaction.mockResolvedValue({ status: 0 })

      await expect(
        service.deposit(mockDarkSwapContext as any, '0xAsset', BigInt(1000))
      ).rejects.toThrow('Deposit failed')

      // Reset mock for other tests
      mockDarkSwapContext.darkSwap.provider.waitForTransaction.mockResolvedValue({ status: 1 })
    })
  })
})
