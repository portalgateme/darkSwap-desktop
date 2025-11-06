import { Token } from '../types'
import { ChainId } from './networkConfig'
import { sepoliaTokens } from './tokens/sepolia'

export const tokenConfig: Record<number, Token[]> = {
  [ChainId.SEPOLIA]: sepoliaTokens
}
