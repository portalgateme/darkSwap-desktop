import { ethers } from 'ethers'
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect
} from 'react'

interface AccountContextType {
  selectedAccount: string | null
  accounts: string[]
  setSelectedAccount: (account: string | null) => void
  openAddModal: boolean
  setOpenAddModal: (open: boolean) => void
  onConnectWallet: (name: string, privateKey: string) => void
}

export const AccountContext = createContext<AccountContextType>({
  selectedAccount: null,
  accounts: [],
  setSelectedAccount: () => {},
  openAddModal: false,
  setOpenAddModal: () => {},
  onConnectWallet: () => {}
})

export const AccountProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [accounts, setAccounts] = useState<string[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [openAddModal, setOpenAddModal] = useState<boolean>(false)

  const fetchAccounts = async () => {
    // @ts-ignore
    const fetchedAccounts = await window.accountAPI.getWallets()
    console.log('Fetched accounts:', fetchedAccounts)
    setAccounts(fetchedAccounts)
    if (!selectedAccount) {
      setSelectedAccount(fetchedAccounts[0] || null)
    }
  }

  const onConnectWallet = (name: string, privateKey: string) => {
    const address = ethers.computeAddress(`0x${privateKey}`)

    // @ts-ignore
    const { id } = window.accountAPI.addWallet(
      name,
      address,
      privateKey,
      'privateKey'
    )
    console.log('Added wallet with id:', id)
    setOpenAddModal(false)
  }
  useEffect(() => {
    fetchAccounts()
  }, [])

  return (
    <AccountContext.Provider
      value={{
        selectedAccount,
        setSelectedAccount,
        accounts,
        openAddModal,
        setOpenAddModal,
        onConnectWallet
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}
