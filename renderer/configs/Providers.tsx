import { ThemeProvider } from '@mui/material'
import { AccountProvider } from '../contexts/AccountContext/AccountProvider'
import { AssetPairProvider } from '../contexts/AssetPairContext/AssetPairProvider'
import { ChainProvider } from '../contexts/ChainContext/ChainProvider'
import { ConfigProvider } from '../contexts/ConfigContext/ConfigProvider'
import { ToastProvider } from '../contexts/ToastContext'
import theme from '../theme'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <ConfigProvider>
          <AccountProvider>
            <ChainProvider>
              <AssetPairProvider>{children}</AssetPairProvider>
            </ChainProvider>
          </AccountProvider>
        </ConfigProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
