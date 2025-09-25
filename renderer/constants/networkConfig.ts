import { Network } from '../types'

export const networks: Network[] = [
  {
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    icon: '/chain/ethereum.png'
  },
  {
    name: 'Arbitrum',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    icon: '/chain/arbitrum.svg'
  },
  {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://base-mainnet.public.blastapi.io',
    icon: '/chain/base.svg'
  },
  {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com/',
    icon: '/chain/polygon.svg'
  }
]
