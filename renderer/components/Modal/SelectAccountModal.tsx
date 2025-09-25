import {
  Box,
  Button,
  InputBase,
  Modal,
  Stack,
  TextareaAutosize,
  Typography
} from '@mui/material'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { shorterAddress } from '../../utils/format'

const mockAccounts = [
  {
    name: 'Account 1',
    address: '0x96d5a4a41c946f6d180945681aeb6196d7aee6e3',
    balance: '1.5 ETH'
  },
  {
    name: 'Account 2',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    balance: '2.0 ETH'
  },
  {
    name: 'Account 3',
    address: '0x8ff2F0a8D017c79454AA28509a19Ab9753c2DD14',
    balance: '0.75 ETH'
  },
  {
    name: 'Account 4',
    address: '0xD5e2d0dD80cDBaf5ea72570267d748db90c04c28',
    balance: '3.2 ETH'
  }
]
interface SelectAccountModalProps {
  open: boolean
  onClose: () => void
  onSelectAccount?: (account: string) => void
  onAddAccount?: () => void
}

export const SelectAccountModal = ({
  open,
  onClose,
  onSelectAccount,
  onAddAccount
}: SelectAccountModalProps) => {
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
          width: 400,
          minHeight: 400,
          background: '#1E2128',
          borderRadius: '20px',
          p: 5,
          outline: 'none'
        }}
      >
        <Typography
          textAlign={'center'}
          color='#F3F4F6'
          variant='h5'
        >
          Select a wallet
        </Typography>
        <Stack
          direction={'row'}
          alignItems='center'
          mt={2}
          gap={1}
          sx={{
            border: '1px solid #DEE1E6',
            borderRadius: '6px',
            p: 1
          }}
        >
          <SearchIcon sx={{ color: '#565D6D' }} />
          <InputBase
            placeholder='Search wallet'
            sx={{
              padding: 0,
              color: 'white',
              '::placeholder': {
                color: '#565D6D'
              }
            }}
          />
        </Stack>

        <Stack
          mt={2}
          spacing={2}
        >
          {mockAccounts.map((account, index) => (
            <Stack
              key={index}
              direction={'row'}
              alignItems={'center'}
              sx={{
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '4px',
                background: '#323743'
              }}
              onClick={() =>
                onSelectAccount && onSelectAccount(account.address)
              }
            >
              {/* Avatar */}
              <Box
                sx={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#565D6D'
                }}
              />
              <Stack ml={2}>
                <Typography
                  variant='body2'
                  color='white'
                >
                  {account.name}
                </Typography>
                <Typography
                  variant='caption'
                  color='#D0D0D0'
                >
                  {shorterAddress(account.address)}
                </Typography>
              </Stack>

              <Typography
                variant='body1'
                color='white'
                ml={'auto'}
              >
                {account.balance}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Button
          variant='contained'
          startIcon={<AddIcon />}
          sx={{
            background: '#68EB8E',
            color: '#000',
            textTransform: 'capitalize',
            borderRadius: '4px',
            mt: 2
          }}
          onClick={onAddAccount}
        >
          Add Wallet
        </Button>
      </Stack>
    </Modal>
  )
}
