import { Button, Stack, Typography } from '@mui/material'
import { Network } from '../../types'
import { useState } from 'react'
import NetworkSelection from '../Selection/NetworkSelection'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { shorterAddress } from '../../utils/format'
import { SelectAccountModal } from '../Modal/SelectAccountModal'

interface HeaderProps {
  title: string
}
export const Header = ({ title }: HeaderProps) => {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>()
  const [selectedAccount, setSelectedAccount] = useState<string>()
  const [openModal, setOpenModal] = useState<boolean>(false)

  const onChangeNetwork = (network: Network) => {
    setSelectedNetwork(network)
  }

  const onOpenSelectAccount = () => {
    setOpenModal(true)
  }

  const onCloseModal = () => {
    setOpenModal(false)
  }

  const onChangeAccount = (account: string) => {
    setSelectedAccount(account)
    onCloseModal()
  }

  const onAddAccount = () => {
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
          selectedNetwork={selectedNetwork}
          onNetworkChange={onChangeNetwork}
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
              ? shorterAddress(selectedAccount)
              : 'Select Account'}
          </Typography>
        </Button>
      </Stack>

      <SelectAccountModal
        open={openModal}
        onClose={onCloseModal}
        onSelectAccount={onChangeAccount}
        onAddAccount={onAddAccount}
      />
    </Stack>
  )
}
