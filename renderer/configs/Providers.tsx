import { AccountProvider } from '../contexts/AccountContext/AccountProvider'
import { AssetPairProvider } from '../contexts/AssetPairContext/AssetPairProvider'
import { ChainProvider } from '../contexts/ChainContext/ChainProvider'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AccountProvider>
      <ChainProvider>
        <AssetPairProvider>{children}</AssetPairProvider>
      </ChainProvider>
    </AccountProvider>
  )
}
