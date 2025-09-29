import React from 'react'
import {
  MenuItem,
  Stack,
  Typography,
  Menu,
  Box,
  Button,
  SxProps
} from '@mui/material'

import { Account } from '../../types'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { shorterAddress } from '../../utils/format'

const mockAccounts: Account[] = [
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

interface AccountSelectionProps {
  selectedAccount?: Account
  onAccountChange: (account: Account) => void
  fullWidth?: boolean
  buttonSx?: SxProps
  menuSx?: SxProps
}

const AccountSelection: React.FC<AccountSelectionProps> = ({
  selectedAccount,
  onAccountChange,
  fullWidth = false,
  buttonSx,
  menuSx
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const onSelectAccount = (account: Account) => {
    onAccountChange(account)
    handleClose()
  }

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'fit-content' }}>
      <Button
        variant='contained'
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          background: '#1E2128',
          borderRadius: '8px',
          textTransform: 'capitalize',
          justifyContent: fullWidth ? 'space-between' : 'flex-start',
          ...buttonSx
        }}
        fullWidth
        onClick={handleClick}
      >
        <Typography variant='body1'>
          {selectedAccount ? selectedAccount.name : 'Select Account'}
        </Typography>
      </Button>

      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: anchorEl?.offsetWidth || 'auto',
              background: 'none'
            }
          },
          list: {
            'aria-labelledby': 'basic-button',
            sx: {
              background: '#1E2128',
              color: '#F3F4F6'
            }
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        {mockAccounts.map((account, index) => (
          <MenuItem
            key={index}
            onClick={() => onSelectAccount(account)}
            sx={{
              '&:hover': { backgroundColor: '#2A2E33' }
            }}
          >
            <Stack
              width={'100%'}
              direction='row'
              alignItems='center'
              justifyContent={'space-between'}
            >
              <Stack
                direction={'row'}
                spacing={2}
                alignItems='center'
              >
                <Typography>{account.name}</Typography>
                <Typography
                  variant='body2'
                  color='#BDC1CA'
                >
                  ({shorterAddress(account.address)})
                </Typography>
              </Stack>

              <Typography>{account.balance}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default AccountSelection
