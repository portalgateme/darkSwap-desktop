import {
  Button,
  Modal,
  Stack,
  TextareaAutosize,
  Typography
} from '@mui/material'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'

interface WalletSetupModalProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
}

export const WalletSetupModal = ({
  open,
  onClose,
  onConfirm
}: WalletSetupModalProps) => {
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
          minHeight: 400,
          background: '#1E2128',
          borderRadius: '20px',
          p: 5,
          outline: 'none'
        }}
      >
        <Typography
          variant='h4'
          color='#F3F4F6'
        >
          Wallet Setup
        </Typography>

        <Typography
          variant='h5'
          color='#F3F4F6'
          mt={4}
        >
          Private Key / Recovery Phrase
        </Typography>
        <Typography
          variant='body1'
          color='#BDC1CA'
          mt={1}
        >
          Enter your private key or 12/24 word recovery phrase securely.
        </Typography>

        <TextareaAutosize
          minRows={5}
          placeholder='Enter your private key or recovery phrase...'
          style={{
            background: '#2C2F33',
            color: '#F3F4F6',
            border: 'none',
            borderRadius: '10px',
            padding: '10px',
            marginTop: '10px',
            outline: 'none'
          }}
        />

        {/* Alert card */}
        <Stack
          direction={'row'}
          spacing={2}
          sx={{
            borderRadius: '10px',
            border: '1px solid #E0E0E0',
            background: '#0C1114',
            p: 2,
            mt: 2
          }}
        >
          <WarningAmberOutlinedIcon sx={{ color: '#F3F4F6', fontSize: 20 }} />
          <Stack>
            <Typography color='white'>Important Security Notice:</Typography>
            <Typography
              variant='body2'
              color='#BDC1CA'
            >
              Never share your private key or recovery phrase with anyone. This
              is the ultimate access to your funds. Store it offline and in
              multiple secure locations. Digital copies are vulnerable. Lost
              keys cannot be recovered by anyone.
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant='contained'
          sx={{
            background: '#68EB8E',
            color: '#000',
            textTransform: 'capitalize',
            borderRadius: '8px',
            mt: 2
          }}
          onClick={onConfirm}
        >
          Save Wallet
        </Button>
      </Stack>
    </Modal>
  )
}
