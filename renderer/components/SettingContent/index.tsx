import { Box, Tab, Tabs } from '@mui/material'
import { useState, SyntheticEvent } from 'react'
import { ApiKeySettings } from './ApiKeySettings'
import { RpcUrlSettings } from './RpcUrlSettings'

export const SettingContent = () => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <Box sx={{ display: 'flex', mt: 3 }}>
      <Tabs
        orientation='vertical'
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          minWidth: 160,
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
          '& .MuiTab-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            alignItems: 'flex-start',
            textTransform: 'none',
            fontSize: '0.95rem',
            '&.Mui-selected': {
              color: '#68EB8E'
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#68EB8E'
          }
        }}
      >
        <Tab label='API Key' />
        <Tab label='RPC URL' />
      </Tabs>
      <Box sx={{ flex: 1, pl: 3 }}>
        {activeTab === 0 && <ApiKeySettings />}
        {activeTab === 1 && <RpcUrlSettings />}
      </Box>
    </Box>
  )
}
