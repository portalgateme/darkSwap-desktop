export interface Network {
  name: string
  chainId: number
  rpcUrl: string
  icon: string
}

export interface Account {
  address: string
  name: string
  balance: string
}

export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}
