import { Button, InputBase, Modal, Stack, Typography } from '@mui/material'
import NetworkSelection from '../Selection/NetworkSelection'
import { Account, Network, Token } from '../../types'
import AccountSelection from '../Selection/AccountSelection'
import TokenSelection from '../Selection/TokenSelection'

interface DepositModalProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
}

export const DepositModal = ({
  open,
  onClose,
  onConfirm
}: DepositModalProps) => {
  const onChangeNetwork = (network: Network) => {
    console.log('Selected network:', network)
  }

  const onChangeAccount = (account: Account) => {
    console.log('Selected account:', account)
  }

  const onChangeToken = (token: Token) => {
    console.log('Selected token:', token)
  }

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Entered amount:', e.target.value)
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
          onAccountChange={onChangeAccount}
          fullWidth
          buttonSx={{
            mt: 2,
            borderRadius: '10px',
            background: '#323743'
          }}
        />
        <NetworkSelection
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
            onTokenChange={onChangeToken}
            buttonSx={{
              borderRadius: '10px',
              background: '#323743'
            }}
            sx={{ flex: 1 }}
          />

          <InputBase
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
          onClick={onConfirm}
        >
          Save Wallet
        </Button>
      </Stack>
    </Modal>
  )
}
