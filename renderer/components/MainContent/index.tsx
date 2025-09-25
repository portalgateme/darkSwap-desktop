import React, { useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import { WalletSetupModal } from '../Modal/WalletSetupModal'
import { UserAssetTable } from '../Table/UserAssetTable'
import NetworkSelection from '../Selection/NetworkSelection'
import { Network } from '../../types'
import { shorterAddress } from '../../utils/format'
import { SelectAccountModal } from '../Modal/SelectAccountModal'

export const MainContent = () => {
  const [openWalletSetup, setOpenWalletSetup] = useState(false)
  const [openSelectAccount, setOpenSelectAccount] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<Network>()
  const [selectedAccount, setSelectedAccount] = useState<string>()

  const onChangeNetwork = (network: Network) => {
    setSelectedNetwork(network)
  }

  const onCloseWalletSetup = () => {
    setOpenWalletSetup(false)
  }

  const onOpenWalletSetup = () => {
    setOpenWalletSetup(true)
  }

  const onConnectWallet = () => {
    setIsConnected(true)
    onCloseWalletSetup()
  }

  const onChangeAccount = (account: string) => {
    setSelectedAccount(account)
    onCloseSelectAccount()
  }

  const onOpenSelectAccount = () => {
    setOpenSelectAccount(true)
  }

  const onCloseSelectAccount = () => {
    setOpenSelectAccount(false)
  }

  const onAddAccount = () => {
    onCloseSelectAccount()
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        background: '#1D2F23',
        padding: '20px 40px'
      }}
    >
      {/* Title */}
      <Stack
        direction={'row'}
        justifyContent='space-between'
        alignItems='center'
      >
        <Typography
          color='#F3F4F6'
          variant='h3'
        >
          Assets Overview
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
      </Stack>

      {/* Summary Metrics */}
      <Stack
        direction={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        padding={3}
        mt={2}
        sx={{
          background: '#1E2128',
          borderRadius: '20px'
        }}
      >
        {/* Balance */}
        <Stack>
          <Typography
            color='#F3F4F6'
            variant='body1'
          >
            Total Portfolio Value
          </Typography>
          <Typography
            color='#F3F4F6'
            variant='h4'
          >
            $54,896.72
          </Typography>
        </Stack>

        {/* Deposit Withdraw */}
        <Stack
          direction={'row'}
          spacing={2}
        >
          <Button
            variant='contained'
            sx={{
              background: '#68EB8E',
              color: '#000',
              textTransform: 'capitalize',
              borderRadius: '8px'
            }}
            endIcon={<FileDownloadOutlinedIcon />}
          >
            Deposit
          </Button>
          <Button
            variant='outlined'
            sx={{
              color: '#68EB8E',
              textTransform: 'capitalize',
              borderRadius: '8px',
              border: '1px solid #68EB8E'
            }}
            endIcon={<FileUploadOutlinedIcon />}
          >
            Withdraw
          </Button>
        </Stack>
      </Stack>
      {/* Assets Table */}
      <Typography
        variant='h5'
        color='#F3F4F6'
        mt={4}
        mb={2}
      >
        Your Assets
      </Typography>
      {/* Have not connected wallet */}
      {isConnected ? (
        <UserAssetTable />
      ) : (
        <Stack
          width={'100%'}
          minHeight={'400px'}
          alignItems={'center'}
          justifyContent={'center'}
          sx={{
            borderRadius: '20px',
            background: '#1E2128'
          }}
        >
          <Button
            variant='contained'
            sx={{
              background: '#68EB8E',
              color: '#000',
              textTransform: 'capitalize',
              borderRadius: '8px'
            }}
            onClick={onOpenWalletSetup}
          >
            Connect Wallet
          </Button>
        </Stack>
      )}

      {/* Connected */}
      <WalletSetupModal
        open={openWalletSetup}
        onClose={onCloseWalletSetup}
        onConfirm={onConnectWallet}
      />

      <SelectAccountModal
        open={openSelectAccount}
        onClose={onCloseSelectAccount}
        onSelectAccount={onChangeAccount}
        onAddAccount={onAddAccount}
      />
    </Box>
  )
}
