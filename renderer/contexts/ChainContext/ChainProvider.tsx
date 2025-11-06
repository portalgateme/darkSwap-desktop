import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect
} from 'react'
import { Network } from '../../types'
import { supportedChains } from '../../constants/networkConfig'

interface ChainContextType {
  chainId?: number
  currentChain?: Network
  supportedChains: Network[]
  onChangeChain: (chainId: Network) => void
}

export const ChainContext = createContext<ChainContextType>({
  chainId: undefined,
  currentChain: undefined,
  supportedChains: supportedChains,
  onChangeChain: () => {}
})

export const ChainProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [chainId, setChainId] = useState<number>()
  const [currentChain, setCurrentChain] = useState<Network>()

  const onChangeChain = (newChain: Network) => {
    setChainId(newChain.chainId)
    setCurrentChain(newChain)
  }

  useEffect(() => {
    // Set default chain on mount
    const defaultChain = supportedChains[0]
    setChainId(defaultChain.chainId)
    setCurrentChain(defaultChain)
  }, [])

  return (
    <ChainContext.Provider
      value={{ chainId, onChangeChain, supportedChains, currentChain }}
    >
      {children}
    </ChainContext.Provider>
  )
}
