import { networkConfig } from '../../../electron/core/config/networkConfig'
import { ChainId } from '../../../electron/core/types'

describe('networkConfig', () => {
  describe('BASE chain config', () => {
    it('should have updated darkSwapAssetManager address', () => {
      expect(networkConfig[ChainId.BASE].darkSwapAssetManager).toBe(
        '0x04dc76740Ad3ad4eDa31b76ED7D2B4fef8b06439'
      )
    })

    it('should have updated darkSwapFeeAssetManager address', () => {
      expect(networkConfig[ChainId.BASE].darkSwapFeeAssetManager).toBe(
        '0x5D130d32A962c1F86A9378d07b60b46De86e6855'
      )
    })

    it('should retain existing BASE config fields', () => {
      const baseConfig = networkConfig[ChainId.BASE]
      expect(baseConfig.priceOracle).toBe('0xf224a25453D76A41c4427DD1C05369BC9f498444')
      expect(baseConfig.ethAddress).toBe('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
      expect(baseConfig.nativeWrapper).toBe('0x4200000000000000000000000000000000000006')
      expect(baseConfig.merkleTreeOperator).toBe('0x918B4F76CAE5F67A3818D8eD3d0e11D9888684E9')
    })
  })

  it('should have config for all supported chains', () => {
    expect(networkConfig[ChainId.MAINNET]).toBeDefined()
    expect(networkConfig[ChainId.ARBITRUM_ONE]).toBeDefined()
    expect(networkConfig[ChainId.BASE]).toBeDefined()
    expect(networkConfig[ChainId.SEPOLIA]).toBeDefined()
    expect(networkConfig[ChainId.HORIZEN_TESTNET]).toBeDefined()
    expect(networkConfig[ChainId.HARDHAT]).toBeDefined()
  })
})
