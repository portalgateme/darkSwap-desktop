import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Menu,
  Box,
  Button
} from '@mui/material'
import { networks } from '../../constants/networkConfig'
import Image from 'next/image'
import { Network } from '../../types'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

interface NetworkSelectionProps {
  selectedNetwork?: Network
  onNetworkChange: (network: Network) => void
}

const NetworkSelection: React.FC<NetworkSelectionProps> = ({
  selectedNetwork,
  onNetworkChange
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const onSelectNetwork = (network: Network) => {
    onNetworkChange(network)
    handleClose()
  }

  return (
    <Box>
      {selectedNetwork ? (
        <Button
          variant='contained'
          startIcon={
            <Image
              src={selectedNetwork.icon}
              alt={selectedNetwork.name}
              width={24}
              height={24}
            />
          }
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            background: '#1E2128',
            borderRadius: '8px',
            textTransform: 'capitalize'
          }}
          onClick={handleClick}
        >
          <Typography variant='body1'>{selectedNetwork.name}</Typography>
        </Button>
      ) : (
        <Button
          variant='contained'
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            background: '#1E2128',
            borderRadius: '8px',
            textTransform: 'capitalize'
          }}
          onClick={handleClick}
        >
          <Typography variant='body1'>Select Network</Typography>
        </Button>
      )}

      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
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
        {networks.map((network) => (
          <MenuItem
            key={network.chainId}
            onClick={() => onSelectNetwork(network)}
            sx={{
              '&:hover': { backgroundColor: '#2A2E33' }
            }}
          >
            <Stack
              spacing={1}
              direction='row'
              alignItems='center'
            >
              <Image
                src={network.icon}
                alt={network.name}
                width={24}
                height={24}
              />
              <Typography>{network.name}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default NetworkSelection
