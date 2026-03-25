import React, {
  createContext,
  ReactNode,
  useState,
  useEffect
} from 'react'
import { useChainContext } from '../ChainContext/hooks'
import { AssetPairDto, Token } from '../../types'

interface AssetPairContextType {
  list: AssetPairDto[]
  assetPair?: AssetPairDto
  onChangeAssetPair?: (pair: AssetPairDto) => void
  tokens: Token[]
}

export const AssetPairContext = createContext<AssetPairContextType>({
  list: [],
  assetPair: undefined,
  onChangeAssetPair: () => {},
  tokens: []
})

export const AssetPairProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [list, setList] = useState<AssetPairDto[]>([])
  const [assetPair, setAssetPair] = useState<AssetPairDto>()
  const [tokens, setTokens] = useState<Token[]>([])
  const { chainId } = useChainContext()

  const fetchAssetPairs = async (chainId: number) => {
    // @ts-ignore
    const assetPairs = (await window.assetPairAPI.getAssetPairs(
      chainId
    )) as AssetPairDto[]

    setList(assetPairs)

    const currentPair = assetPairs[0]
    if (!currentPair) return
    setAssetPair(currentPair)

    // @ts-ignore
    const dynamicTokens = (await window.assetPairAPI.getTokensByChainId(
      chainId
    )) as Token[]
    setTokens(dynamicTokens)
  }

  useEffect(() => {
    if (!chainId) return
    fetchAssetPairs(chainId)
  }, [chainId])

  return (
    <AssetPairContext.Provider
      value={{
        list,
        assetPair,
        onChangeAssetPair: setAssetPair,
        tokens
      }}
    >
      {children}
    </AssetPairContext.Provider>
  )
}
