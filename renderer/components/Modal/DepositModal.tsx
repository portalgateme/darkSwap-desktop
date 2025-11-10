import { Button, InputBase, Modal, Stack, Typography } from '@mui/material'
import NetworkSelection from '../Selection/NetworkSelection'
import { Account, Network, Token } from '../../types'
import AccountSelection from '../Selection/AccountSelection'
import TokenSelection from '../Selection/TokenSelection'
import { useState } from 'react'
import { ethers } from 'ethers'

interface DepositModalProps {
  open: boolean
  onClose: () => void
  loading?: boolean
  onConfirm?: (
    chainId: number,
    wallet: string,
    asset: string,
    amount: string
  ) => void
}

export const DepositModal = ({
  open,
  onClose,
  onConfirm,
  loading = false
}: DepositModalProps) => {
  const [data, setData] = useState<{
    network?: Network
    account?: string
    token?: Token
    amount: string
  }>({
    network: undefined,
    account: undefined,
    token: undefined,
    amount: ''
  })
  const onChangeNetwork = (network: Network) => {
    console.log('Selected network:', network)
    setData((prev) => ({ ...prev, network }))
  }

  const onChangeAccount = (account: string) => {
    console.log('Selected account:', account)
    setData((prev) => ({ ...prev, account }))
  }

  const onChangeToken = (token: Token) => {
    console.log('Selected token:', token)
    setData((prev) => ({ ...prev, token }))
  }

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (value === '.') {
      // Prevent starting with a dot
      setData((prev) => ({ ...prev, amount: '0.' }))
      return
    }

    // Validate that the value is numeric (including empty string and decimal numbers)
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setData((prev) => ({ ...prev, amount: value }))
    }
  }

  const handleConfirm = () => {
    if (!data.network || !data.account || !data.token || !data.amount) {
      console.error('Missing required data for deposit')
      return
    }
    if (!onConfirm) return
    onConfirm(
      data.network.chainId,
      data.account,
      data.token.address,
      ethers.parseUnits(data.amount, data.token.decimals).toString()
    )
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <Stack
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          minHeight: 200,
          background: '#1E2128',
          borderRadius: '20px',
          p: 4,
          outline: 'none'
        }}
      >
        <Typography
          variant='h5'
          color='#F3F4F6'
        >
          Deposit Preview
        </Typography>

        <Typography
          variant='body1'
          color='#BDC1CA'
        >
          Specify the asset and amount for your transaction.
        </Typography>

        <AccountSelection
          selectedAccount={data.account}
          onAccountChange={onChangeAccount}
          fullWidth
          buttonSx={{
            mt: 2,
            borderRadius: '10px',
            background: '#323743'
          }}
        />
        <NetworkSelection
          selectedNetwork={data.network}
          onNetworkChange={onChangeNetwork}
          fullWidth
          buttonSx={{
            mt: 2,
            borderRadius: '10px',
            background: '#323743'
          }}
        />

        <Stack
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
          spacing={2}
          mt={2}
        >
          <TokenSelection
            selectedToken={data.token}
            onTokenChange={onChangeToken}
            buttonSx={{
              borderRadius: '10px',
              background: '#323743'
            }}
            sx={{ flex: 1 }}
          />

          <InputBase
            value={data.amount}
            onChange={onChangeAmount}
            placeholder='Enter amount'
            sx={{
              flex: 1,
              p: '6px 16px',
              borderRadius: '10px',
              background: '#323743',
              color: '#F3F4F6'
            }}
            inputProps={{
              style: { padding: 0 }
            }}
          />
        </Stack>

        <Button
          variant='contained'
          sx={{
            background: '#68EB8E',
            color: '#000',
            textTransform: 'capitalize',
            borderRadius: '8px',
            mt: 5
          }}
          disabled={loading}
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </Stack>
    </Modal>
  )
}
