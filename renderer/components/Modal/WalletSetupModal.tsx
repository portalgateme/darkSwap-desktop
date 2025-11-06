import {
  Button,
  InputBase,
  Modal,
  Stack,
  TextareaAutosize,
  Typography
} from '@mui/material'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { useState } from 'react'

interface WalletSetupModalProps {
  open: boolean
  onClose: () => void
  onConfirm?: (name: string, privateKey: string) => void
}

export const WalletSetupModal = ({
  open,
  onClose,
  onConfirm
}: WalletSetupModalProps) => {
  const [name, setName] = useState('')
  const [privateKey, setPrivateKey] = useState('')

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const onChangePrivateKey = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrivateKey(e.target.value)
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(name, privateKey)
    }
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
          Name
        </Typography>

        <InputBase
          placeholder='Enter the name of wallet'
          sx={{
            background: '#2C2F33',
            color: '#F3F4F6',
            border: 'none',
            borderRadius: '10px',
            padding: '10px',
            marginTop: '10px',
            outline: 'none'
          }}
          onChange={onChangeName}
          value={name}
        />

        <Typography
          variant='h5'
          color='#F3F4F6'
          mt={4}
        >
          Private Key
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
          onChange={onChangePrivateKey}
          value={privateKey}
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
          onClick={handleConfirm}
        >
          Save Wallet
        </Button>
      </Stack>
    </Modal>
  )
}
