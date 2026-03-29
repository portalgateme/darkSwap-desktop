import {
  Button,
  CircularProgress,
  InputBase,
  Stack,
  Typography
} from '@mui/material'
import { useContext, useEffect, useState, useCallback } from 'react'
import { ChainContext } from '../../contexts/ChainContext/ChainProvider'

export const RpcUrlSettings = () => {
  const { currentChain } = useContext(ChainContext)
  const [rpcUrl, setRpcUrl] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchRpcUrl = useCallback(async (chainId: number) => {
    try {
      // @ts-ignore
      const result = await window.configAPI.getRpcUrl(chainId)
      setRpcUrl(result.rpcUrl)
      setIsCustom(result.isCustom)
      setError(null)
    } catch (err) {
      console.error('Error fetching RPC URL:', err)
      setError('Failed to load RPC URL')
    }
  }, [])

  useEffect(() => {
    if (currentChain?.chainId) {
      fetchRpcUrl(currentChain.chainId)
    }
  }, [currentChain?.chainId, fetchRpcUrl])

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  const onSave = async () => {
    if (!currentChain?.chainId) return

    if (!validateUrl(rpcUrl)) {
      setError('Invalid URL. Must start with http:// or https://')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // @ts-ignore
      const result = await window.configAPI.setRpcUrl(currentChain.chainId, rpcUrl)
      if (result.success) {
        await fetchRpcUrl(currentChain.chainId)
      } else {
        setError('Failed to save RPC URL')
      }
    } catch (err) {
      console.error('Error saving RPC URL:', err)
      setError('Failed to save RPC URL')
    } finally {
      setLoading(false)
    }
  }

  const onReset = async () => {
    if (!currentChain?.chainId) return

    setLoading(true)
    setError(null)
    try {
      // @ts-ignore
      const result = await window.configAPI.resetRpcUrl(currentChain.chainId)
      if (result.success) {
        await fetchRpcUrl(currentChain.chainId)
      } else {
        setError('Failed to reset RPC URL')
      }
    } catch (err) {
      console.error('Error resetting RPC URL:', err)
      setError('Failed to reset RPC URL')
    } finally {
      setLoading(false)
    }
  }

  if (!currentChain) {
    return (
      <Stack mt={5}>
        <Typography color='white'>No chain selected</Typography>
      </Stack>
    )
  }

  return (
    <Stack mt={5}>
      <Stack width={600}>
        <Typography color='white' sx={{ mb: 3, fontSize: '1rem' }}>
          Current Chain: {currentChain.name} ({currentChain.chainId})
        </Typography>

        <Typography color='white' sx={{ mb: 1 }}>
          RPC URL:
        </Typography>

        <Stack
          sx={{
            borderBottom: `1px solid ${error ? '#FF6B6B' : 'white'}`
          }}
        >
          <InputBase
            value={rpcUrl}
            onChange={(e) => {
              setRpcUrl(e.target.value)
              setError(null)
            }}
            placeholder='https://...'
            disabled={loading}
            sx={{
              width: '100%',
              color: error ? '#FF6B6B' : 'white'
            }}
          />
        </Stack>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: '0.8rem',
            color: isCustom ? '#68EB8E' : 'rgba(255, 255, 255, 0.5)'
          }}
        >
          {isCustom ? '(custom)' : '(default)'}
        </Typography>

        {error && (
          <Typography
            sx={{
              mt: 1,
              fontSize: '0.85rem',
              color: '#FF6B6B'
            }}
          >
            {error}
          </Typography>
        )}
      </Stack>

      <Stack mt={4} spacing={2} direction='row'>
        {isCustom && (
          <Button
            variant='outlined'
            sx={{
              border: '1px solid #68EB8E',
              color: '#68EB8E'
            }}
            onClick={onReset}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#68EB8E' }} /> : 'Reset to Default'}
          </Button>
        )}
        <Button
          variant='contained'
          sx={{
            background: '#68EB8E',
            color: '#0A0A0A',
            '&.Mui-disabled': {
              border: 'none',
              background: 'inherit'
            }
          }}
          onClick={onSave}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#68EB8E' }} /> : 'Save'}
        </Button>
      </Stack>
    </Stack>
  )
}
