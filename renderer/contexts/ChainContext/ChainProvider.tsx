import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect
} from 'react'
import { Network } from '../../types'
import { chains } from '../../constants/networkConfig'

interface ChainContextType {
  chainId?: number
  currentChain?: Network
  supportedChains: Network[]
  onChangeChain: (chainId: Network) => void
}

export const ChainContext = createContext<ChainContextType>({
  chainId: undefined,
  currentChain: undefined,
  supportedChains: [],
  onChangeChain: () => {}
})

export const ChainProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [chainId, setChainId] = useState<number>()
  const [currentChain, setCurrentChain] = useState<Network>()
  const [supportedChains, setSupportedChains] = useState<Network[]>([])

  const getSupportChains = async () => {
    const supportedChains =
      // @ts-ignore
      (await window.rpcManagerAPI.getAllProviders()) as Array<{
        chainId: number
        rpcUrl: string
      }>

    console.log('Supported chains from rpcManagerAPI:', supportedChains)

    return chains.filter((chain) =>
      supportedChains.some(
        (supportedChain) => supportedChain.chainId === chain.chainId
      )
    )
  }

  const onChangeChain = (newChain: Network) => {
    setChainId(newChain.chainId)
    setCurrentChain(newChain)
  }

  useEffect(() => {
    // Set default chain on mount
    getSupportChains().then((supportedChains) => {
      console.log('Filtered supported chains:', supportedChains)
      setSupportedChains(supportedChains)
      const defaultChain = supportedChains[0]
      setChainId(defaultChain.chainId)
      setCurrentChain(defaultChain)
    })
  }, [])

  return (
    <ChainContext.Provider
      value={{ chainId, onChangeChain, supportedChains, currentChain }}
    >
      {children}
    </ChainContext.Provider>
  )
}
