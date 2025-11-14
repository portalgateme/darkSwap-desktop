import { Box, Button, Stack, Typography } from '@mui/material'
import { Sidebar } from '../Sidebar'

import { Header } from '../Header'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { WalletSetupModal } from '../Modal/WalletSetupModal'

export const Layout = ({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) => {
  const { openAddModal, setOpenAddModal, onConnectWallet } = useAccountContext()
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
          height: 'calc(100vh - 40px)', // Adjusted height to fit within viewport minus padding
          background: '#1D2F23',
          padding: '20px 40px'
        }}
      >
        <Header title={title} />
        {children}
      </Box>

      <WalletSetupModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onConfirm={onConnectWallet}
      />
    </Stack>
  )
}
