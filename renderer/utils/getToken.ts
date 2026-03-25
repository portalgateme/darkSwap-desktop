import { Token } from '../types'

export const getTokenFromContract = (
  address?: string | null,
  chainId?: number,
  tokens?: Token[]
) => {
  if (!address || !tokens) return
  return tokens.find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  )
}
