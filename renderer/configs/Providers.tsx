import { AccountProvider } from '../contexts/AccountContext/AccountProvider'
import { AssetPairProvider } from '../contexts/AssetPairContext/AssetPairProvider'
import { ChainProvider } from '../contexts/ChainContext/ChainProvider'
import { ConfigProvider } from '../contexts/ConfigContext/ConfigProvider'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider>
      <AccountProvider>
        <ChainProvider>
          <AssetPairProvider>{children}</AssetPairProvider>
        </ChainProvider>
      </AccountProvider>
    </ConfigProvider>
  )
}
