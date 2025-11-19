import { Button, InputBase, Modal, Stack, Typography } from '@mui/material'
import NetworkSelection from '../Selection/NetworkSelection'
import { Account, Network, Token, Wallet } from '../../types'
import AccountSelection from '../Selection/AccountSelection'
import TokenSelection from '../Selection/TokenSelection'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

interface WithdrawModalProps {
  open: boolean
  onClose: () => void
  loading?: boolean
  error: string | null
  onConfirm?: (
    chainId: number,
    wallet: Wallet,
    asset: string,
    amount: string
  ) => void
}

export const WithdrawModal = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  error = null
}: WithdrawModalProps) => {
  const [data, setData] = useState<{
    network?: Network
    account?: Wallet
    token?: Token
    amount: string
  }>({
    network: undefined,
    account: undefined,
    token: undefined,
    amount: ''
  })

  useEffect(() => {
    if (!open) {
      setData({
        network: undefined,
        account: undefined,
        token: undefined,
        amount: ''
      })
    }
  }, [open])

  const onChangeNetwork = (network: Network) => {
    setData((prev) => ({ ...prev, network }))
  }

  const onChangeAccount = (account: Wallet) => {
    setData((prev) => ({ ...prev, account }))
  }

  const onChangeToken = (token: Token) => {
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

  const btnDisabled =
    !data.network || !data.account || !data.token || !data.amount || loading
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
          Withdraw Preview
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

        {error && (
          <Typography
            color='error'
            variant='body2'
            sx={{ mt: 2 }}
          >
            {error}
          </Typography>
        )}

        <Button
          variant='contained'
          sx={{
            background: '#68EB8E',
            color: '#000',
            textTransform: 'capitalize',
            borderRadius: '8px',
            mt: 5
          }}
          disabled={btnDisabled}
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </Stack>
    </Modal>
  )
}
