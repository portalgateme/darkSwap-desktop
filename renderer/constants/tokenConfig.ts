import { Token } from '../types'
import { ChainId } from './networkConfig'
import { baseTokens } from './tokens/base'
import { horizenTestnetTokens } from './tokens/horizenTestnet'
import { sepoliaTokens } from './tokens/sepolia'

export const tokenConfig: Record<number, Token[]> = {
  [ChainId.SEPOLIA]: sepoliaTokens,
  [ChainId.HORIZEN_TESTNET]: horizenTestnetTokens,
  [ChainId.BASE]: baseTokens
}

export const nativeToken: Record<number, Token> = {
  [ChainId.SEPOLIA]: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
  },
  [ChainId.HORIZEN_TESTNET]: {
    name: 'Horizen Testnet Ether',
    symbol: 'ETH',
    decimals: 18,
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
  },
  [ChainId.BASE]: {
    name: 'Base Ether',
    symbol: 'BaseETH',
    decimals: 18,
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
  }
}
