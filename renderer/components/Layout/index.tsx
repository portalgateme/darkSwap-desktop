import { Box, Button, Stack, Typography } from '@mui/material'
import { Sidebar } from '../Sidebar'
import NetworkSelection from '../Selection/NetworkSelection'
import { Header } from '../Header'

export const Layout = ({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) => {
  return (
    <Stack
      direction={'row'}
      sx={{
        width: '100%',
        height: '100vh'
      }}
    >
      <Sidebar />
      <Box
        sx={{
          width: '100%',
          height: '100%',
          background: '#1D2F23',
          padding: '20px 40px'
        }}
      >
        <Header title={title} />
        {children}
      </Box>
    </Stack>
  )
}
