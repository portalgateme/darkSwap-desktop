import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  InputBase
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

interface SetupApiKeyModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (apiKey: string) => void
}

const SetupApiKeyModal: React.FC<SetupApiKeyModalProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      onSubmit(apiKey.trim())
      setApiKey('')
      onClose()
    }
  }

  const handleToggleVisibility = () => {
    setShowApiKey(!showApiKey)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        style: { borderRadius: 16, background: '#1E2128' }
      }}
    >
      <DialogTitle color='white'>Setup API Key</DialogTitle>
      <Box
        component='form'
        onSubmit={handleSubmit}
      >
        <DialogContent>
          <InputBase
            fullWidth
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder='Enter your API key'
            required
            endAdornment={
              <InputAdornment position='end'>
                <IconButton
                  onClick={handleToggleVisibility}
                  edge='end'
                >
                  {showApiKey ? (
                    <VisibilityOff sx={{ color: '#ccc' }} />
                  ) : (
                    <Visibility sx={{ color: '#ccc' }} />
                  )}
                </IconButton>
              </InputAdornment>
            }
            sx={{
              border: '1px solid #ccc',
              borderRadius: 1,
              padding: '8px 12px',
              color: 'white'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            onClick={onClose}
            sx={{
              border: '1px solid #68EB8E',
              color: '#68EB8E'
            }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            sx={{
              background: '#68EB8E',
              color: '#000',
              '& .MuiCircularProgress-root': {
                color: '#68EB8E'
              }
            }}
          >
            Save API Key
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default SetupApiKeyModal
