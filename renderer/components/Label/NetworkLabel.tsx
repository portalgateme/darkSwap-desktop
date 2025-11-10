import { supportedChains } from '../../constants/networkConfig'

export const NetworkLabel = ({ chainId }: { chainId: number }) => {
  return (
    supportedChains.find((chain) => chain.chainId === chainId)?.name ||
    'Unknown'
  )
}
