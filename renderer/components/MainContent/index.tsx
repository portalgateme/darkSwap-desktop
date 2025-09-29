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
import { DepositModal } from '../Modal/DepositModal'
import { WithdrawModal } from '../Modal/WithdrawModal'

enum Modal {
  Deposit = 'DEPOSIT',
  Withdraw = 'WITHDRAW',
  WalletSetup = 'WALLET_SETUP',
  SelectAccount = 'SELECT_ACCOUNT'
}

export const MainContent = () => {
  const [openModal, setOpenModal] = useState<Modal | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<Network>()
  const [selectedAccount, setSelectedAccount] = useState<string>()

  const onChangeNetwork = (network: Network) => {
    setSelectedNetwork(network)
  }

  const onCloseModal = () => {
    setOpenModal(null)
  }

  const onOpenWalletSetup = () => {
    setOpenModal(Modal.WalletSetup)
  }

  const onConnectWallet = () => {
    setIsConnected(true)
    onCloseModal()
  }

  const onChangeAccount = (account: string) => {
    setSelectedAccount(account)
    onCloseModal()
  }

  const onOpenSelectAccount = () => {
    setOpenModal(Modal.SelectAccount)
  }

  const onAddAccount = () => {
    onCloseModal()
  }

  const onOpenDeposit = () => {
    setOpenModal(Modal.Deposit)
  }

  const onConfirmDeposit = () => {
    // Handle deposit logic here
    onCloseModal()
  }

  const onOpenWithdraw = () => {
    setOpenModal(Modal.Withdraw)
  }

  const onConfirmWithdraw = () => {
    // Handle withdraw logic here
    onCloseModal()
  }

  return (
    <Box>
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
            onClick={onOpenDeposit}
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
            onClick={onOpenWithdraw}
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
        open={openModal === Modal.WalletSetup}
        onClose={onCloseModal}
        onConfirm={onConnectWallet}
      />

      <DepositModal
        open={openModal === Modal.Deposit}
        onClose={onCloseModal}
        onConfirm={onConfirmDeposit}
      />

      <WithdrawModal
        open={openModal === Modal.Withdraw}
        onClose={onCloseModal}
        onConfirm={onConfirmWithdraw}
      />
    </Box>
  )
}
