import React, { useState } from 'react'
import { Button, Modal, Stack, Tab, Tabs } from '@mui/material'
import { LimitOrderForm } from '../Form/LimitOrderForm'

interface PlaceOrderModalProps {
  open: boolean
  onClose: () => void
}

enum PlaceOrderTab {
  LIMIT,
  STOP_LIMIT,
  TAKE_PROFIT
}

export const PlaceOrderModal: React.FC<PlaceOrderModalProps> = ({
  open,
  onClose
}) => {
  const [tab, setTab] = useState<PlaceOrderTab>(PlaceOrderTab.LIMIT)
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
          width: 600,
          minHeight: 200,
          background: '#1E2128',
          borderRadius: '20px',
          p: 4,
          outline: 'none'
        }}
      >
        <Tabs
          sx={{
            background: '#262A33',
            padding: '8px',
            borderRadius: '10px',
            height: 'fit-content',
            minHeight: 'fit-content',
            mb: 3,

            button: {
              color: '#fff',
              textTransform: 'capitalize',
              minHeight: '32px',
              fontWeight: 600,
              '&.Mui-selected': {
                color: '#1b1d22',
                background: '#68EB8E',
                borderRadius: '8px'
              }
            }
          }}
          slotProps={{
            indicator: { style: { display: 'none' } }
          }}
          onChange={(_, value) => setTab(value as PlaceOrderTab)}
          value={tab}
        >
          <Tab
            label='Limit'
            value={PlaceOrderTab.LIMIT}
            sx={{ width: '33.33%' }}
          />
          <Tab
            label='Stop Limit'
            value={PlaceOrderTab.STOP_LIMIT}
            sx={{ width: '33.33%' }}
          />
          <Tab
            label='Take Profit'
            value={PlaceOrderTab.TAKE_PROFIT}
            sx={{ width: '33.33%' }}
          />
        </Tabs>

        {/* Form */}
        {tab === PlaceOrderTab.LIMIT && <LimitOrderForm />}
        {tab === PlaceOrderTab.STOP_LIMIT && <div>StopLimitOrderForm</div>}
        {tab === PlaceOrderTab.TAKE_PROFIT && <div>TakeProfitOrderForm</div>}
      </Stack>
    </Modal>
  )
}
