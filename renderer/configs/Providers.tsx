import { AccountProvider } from '../contexts/AccountContext/AccountProvider'
import { ChainProvider } from '../contexts/ChainContext/ChainProvider'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AccountProvider>
      <ChainProvider>{children}</ChainProvider>
    </AccountProvider>
  )
}
