import { Token } from '../types'
import { ChainId } from './networkConfig'
import { sepoliaTokens } from './tokens/sepolia'

export const tokenConfig: Record<number, Token[]> = {
  [ChainId.SEPOLIA]: sepoliaTokens
}

export const nativeToken: Record<number, Token> = {
  [ChainId.SEPOLIA]: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
  }
}
