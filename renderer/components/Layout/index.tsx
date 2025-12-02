import { Box, Button, Stack, Typography } from '@mui/material'
import { Sidebar } from '../Sidebar'

import { Header } from '../Header'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { WalletSetupModal } from '../Modal/WalletSetupModal'
import SetupApiKeyModal from '../Modal/SetupApiKeyModal'
import { useConfigContext } from '../../contexts/ConfigContext/hooks'
import { useEffect, useState } from 'react'

export const Layout = ({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) => {
  const [openApiKeyModal, setOpenApiKeyModal] = useState(false)
  const { openAddModal, setOpenAddModal, onConnectWallet } = useAccountContext()
  const { apiKey, saveApiKey } = useConfigContext()

  const onSaveApiKey = async (key: string) => {
    await saveApiKey(key)
    setOpenApiKeyModal(false)
  }

  useEffect(() => {
    if (!apiKey) {
      setOpenApiKeyModal(true)
    } else {
      setOpenApiKeyModal(false)
    }
  }, [apiKey])

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

      <SetupApiKeyModal
        open={openApiKeyModal}
        onClose={() => setOpenApiKeyModal(false)}
        onSubmit={onSaveApiKey}
      />
    </Stack>
  )
}
