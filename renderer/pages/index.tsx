import { Box, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { MainContent } from '../components/MainContent'

export default function Home() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    if ((window as any).electronAPI) {
      setMessage((window as any).electronAPI.ping())
    }
  }, [])

  return (
    <Stack
      direction={'row'}
      sx={{
        width: '100%',
        height: '100vh'
      }}
    >
      <Sidebar />
      <MainContent />
    </Stack>
  )
}
