import { Button, InputBase, Stack, Typography } from '@mui/material'
import NetworkSelection from '../Selection/NetworkSelection'
import { useState } from 'react'
import { Network, Token } from '../../types'
import { Label } from '../Label'
import { LabelAssetAmountInput } from '../Input/LabelAssetAmountInput'
import { tokenConfig } from '../../constants/tokenConfig'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import { IOSSwitchButton } from '../Button/IOSSwitchButton'

export const LimitOrderForm = () => {
  const [formData, setFormData] = useState<{
    network: Network | undefined
    amount: string
    price: string
    assetIn: Token
    assetOut: Token
    useMarketPrice: boolean
  }>({
    network: undefined,
    amount: '',
    price: '',
    assetIn: tokenConfig[0],
    assetOut: tokenConfig[1],
    useMarketPrice: false
  })

  const onPlaceOrder = () => {
    // Handle place order logic
  }

  return (
    <Stack>
      <NetworkSelection
        selectedNetwork={formData.network}
        onNetworkChange={(network) => setFormData({ ...formData, network })}
        buttonSx={{
          border: '1px solid #3A3E47'
        }}
        fullWidth
      />

      <Stack
        direction='row'
        alignItems={'center'}
        justifyContent={'space-between'}
        sx={{
          background: '#262A33',
          borderRadius: '8px',
          p: '4px 12px',
          mb: 2,
          mt: 2,
          border: '1px solid #3A3E47'
        }}
      >
        <Typography color='#F3F4F6B8'>Limit Price</Typography>
        <Stack
          direction={'row'}
          spacing={1}
          alignItems='center'
        >
          <InputBase
            placeholder='Amount'
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            // text right to left for input
            sx={{
              color: '#F3F4F6B8',
              direction: 'rtl'
            }}
          />
          <Typography color='#F3F4F6B8'>USDC/ETH</Typography>
        </Stack>
      </Stack>

      <LabelAssetAmountInput
        label='You sell'
        token={formData.assetIn}
      />

      <Stack
        width={'100%'}
        alignItems='center'
        justifyContent={'center'}
        sx={{ mt: 2, mb: 2 }}
      >
        <SwapVertIcon
          sx={{
            color: '#F3F4F6B8',
            p: 0.5,
            border: '1px solid #3A3E47',
            borderRadius: '50%',
            cursor: 'pointer',
            ':hover': { background: '#3A3E47' }
          }}
        />
      </Stack>

      <LabelAssetAmountInput
        label='You buy'
        token={formData.assetOut}
      />

      <Stack
        mt={2}
        spacing={1}
      >
        <IOSSwitchButton
          checked={formData.useMarketPrice}
          onChange={() =>
            setFormData({
              ...formData,
              useMarketPrice: !formData.useMarketPrice
            })
          }
          label='Use Market Price'
        />

        <Stack
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Typography
            variant='body1'
            color='#BDC1CA'
          >
            Rate
          </Typography>
          <Typography
            variant='body1'
            color='#BDC1CA'
          >
            1 ETH = 4000 USDC
          </Typography>
        </Stack>
        <Stack
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Typography
            variant='body1'
            color='#BDC1CA'
          >
            Service Fee
          </Typography>
          <Typography
            variant='body1'
            color='#BDC1CA'
          >
            1 USDC
          </Typography>
        </Stack>
        <Stack
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Typography
            variant='body1'
            color='#BDC1CA'
          >
            Time in Force
          </Typography>
          <Typography
            variant='body1'
            color='#BDC1CA'
          >
            Good Till Cancelled
          </Typography>
        </Stack>
      </Stack>
      <Button
        variant='contained'
        sx={{
          background: '#68EB8E',
          color: '#000',
          textTransform: 'capitalize',
          borderRadius: '8px',
          mt: 5
        }}
        onClick={onPlaceOrder}
      >
        Place Order
      </Button>
    </Stack>
  )
}
