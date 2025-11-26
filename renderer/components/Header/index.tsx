import { Button, Stack, Typography } from '@mui/material'
import { Network, Wallet } from '../../types'
import { useState } from 'react'
import NetworkSelection from '../Selection/NetworkSelection'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { shorterAddress } from '../../utils/format'
import { SelectAccountModal } from '../Modal/SelectAccountModal'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { useChainContext } from '../../contexts/ChainContext/hooks'

interface HeaderProps {
  title: string
}
export const Header = ({ title }: HeaderProps) => {
  const [openModal, setOpenModal] = useState<boolean>(false)

  const { selectedAccount, setSelectedAccount, setOpenAddModal } =
    useAccountContext()
  const { onChangeChain, currentChain } = useChainContext()

  const onOpenSelectAccount = () => {
    setOpenModal(true)
  }

  const onCloseModal = () => {
    setOpenModal(false)
  }

  const onChangeAccount = (account: Wallet) => {
    setSelectedAccount(account)
    onCloseModal()
  }

  return (
    <Stack
      direction={'row'}
      justifyContent='space-between'
      alignItems='center'
    >
      <Typography
        color='#F3F4F6'
        variant='h3'
      >
        {title}
      </Typography>

      <Stack
        direction={'row'}
        spacing={2}
      >
        <NetworkSelection
          selectedNetwork={currentChain}
          onNetworkChange={onChangeChain}
        />

        <Button
          variant='contained'
          startIcon={<AccountBalanceWalletIcon />}
          sx={{
            background: '#1E2128',
            borderRadius: '8px',
            textTransform: 'capitalize'
          }}
          onClick={onOpenSelectAccount}
        >
          <Typography variant='body1'>
            {selectedAccount
              ? shorterAddress(selectedAccount.address)
              : 'Connect Wallet'}
          </Typography>
        </Button>
      </Stack>

      <SelectAccountModal
        open={openModal}
        onClose={onCloseModal}
        onSelectAccount={onChangeAccount}
      />
    </Stack>
  )
}
