import { OrderDto, OrderEventDto } from 'darkswap-client-core'

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
  name?: string
  decimals: number
  logoURI?: string
}

export interface Wallet {
  id: string
  name: string
  address: string
  privateKey?: string
  type: 'privateKey' | 'fireblocks'
}

export interface AssetPairDto {
  baseAddress: string
  baseDecimal: number
  baseSymbol: string
  chainId: number
  createdAt: string
  id: string
  quoteAddress: string
  quoteDecimal: number
  quoteSymbol: string
  updatedAt: string
}

export enum OrderDirection {
  BUY = 0,
  SELL = 1
}

export enum OrderType {
  MARKET = 0,
  LIMIT = 1,
  STOP_LOSS = 2,
  STOP_LOSS_LIMIT = 3,
  TAKE_PROFIT = 4,
  TAKE_PROFIT_LIMIT = 5,
  LIMIT_MAKER = 6
}

export enum TimeInForce {
  GTC = 0,
  GTD = 1,
  IOC = 2,
  FOK = 4,
  AON_GTC = 8,
  AON_GTD = 9
}

export enum StpMode {
  NONE = 0,
  EXPIRE_MAKER = 1,
  EXPIRE_TAKER = 2,
  BOTH = 3
}

export enum OrderStatus {
  OPEN = 0,
  MATCHED = 1,
  BOB_CONFIRMED = 2,
  SETTLED = 3,
  CANCELLED = 4,
  NOT_TRIGGERED = 5,
  TRIGGERED = 6
}

export interface OrderEvents extends OrderDto {
  events: OrderEventDto[]
}
