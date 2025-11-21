import { MyAssetsDto } from 'darkswap-client-core'
import { useEffect, useState } from 'react'
import { useAccountContext } from '../contexts/AccountContext/hooks'
import { useChainContext } from '../contexts/ChainContext/hooks'

export const useGetAssets = () => {
  const [listData, setListData] = useState<MyAssetsDto>()

  const { selectedAccount } = useAccountContext()
  const { chainId } = useChainContext()

  const fetchAssets = async (chainId: number, address: string) => {
    // @ts-ignore
    const assets = await window.accountAPI.getAssetsByChainIdAndWallet(
      chainId,
      address
    )
    console.log('Fetched assets:', assets)
    setListData(assets)
  }

  useEffect(() => {
    if (!selectedAccount || !chainId) return
    fetchAssets(chainId, selectedAccount.address)
  }, [chainId, selectedAccount])

  return { listData, fetchAssets }
}
