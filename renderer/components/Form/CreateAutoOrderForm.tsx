import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import NetworkSelection from '../Selection/NetworkSelection'
import AccountSelection from '../Selection/AccountSelection'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { useAssetPairContext } from '../../contexts/AssetPairContext/hooks'
import {
  CreateAutoOrderFormData,
  OrderDirection,
  OrderType,
  Wallet
} from '../../types'

interface CreateAutoOrderFormProps {
  formData: CreateAutoOrderFormData
  onChangeData: (data: Partial<CreateAutoOrderFormData>) => void
  selectedWallet?: Wallet
  onChangeWallet: (wallet: Wallet) => void
}

export const CreateAutoOrderForm: React.FC<CreateAutoOrderFormProps> = ({
  formData,
  onChangeData,
  selectedWallet,
  onChangeWallet
}) => {
  const { chainId, currentChain, onChangeChain } = useChainContext()
  const {
    list,
    assetPair: selectedPair,
    onChangeAssetPair
  } = useAssetPairContext()

  return (
    <Stack
      spacing={2}
      sx={{
        padding: 2,
        borderRadius: '16px'
      }}
    >
      <Stack
        direction='row'
        spacing={2}
        flexWrap='wrap'
        alignItems={'center'}
      >
        <NetworkSelection
          selectedNetwork={currentChain}
          onNetworkChange={onChangeChain}
          buttonSx={{ border: '1px solid #3A3E47' }}
        />
        <AccountSelection
          selectedAccount={selectedWallet}
          onAccountChange={(account) => onChangeWallet(account)}
          buttonSx={{ border: '1px solid #3A3E47' }}
        />
        <Select
          value={selectedPair?.id || ''}
          onChange={(e) => {
            const pair = list.find((p) => p.id === e.target.value)
            if (pair && onChangeAssetPair) onChangeAssetPair(pair)
          }}
          displayEmpty
          sx={{
            minWidth: 220,
            background: '#262A33',
            color: '#F3F4F6',
            borderRadius: '8px'
          }}
          size='small'
        >
          <MenuItem value=''>Select Asset Pair</MenuItem>
          {list.map((pair) => (
            <MenuItem
              key={pair.id}
              value={pair.id}
            >
              {pair.baseSymbol}/{pair.quoteSymbol}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <Stack
        direction='row'
        gap={2}
        flexWrap='wrap'
        alignItems={'center'}
      >
        <Select
          value={formData.orderDirection}
          onChange={(e) =>
            onChangeData({
              orderDirection: Number(e.target.value)
            })
          }
          sx={{
            minWidth: 160,
            background: '#262A33',
            color: '#F3F4F6',
            borderRadius: '8px'
          }}
          size='small'
        >
          <MenuItem value={OrderDirection.BUY}>Buy</MenuItem>
          <MenuItem value={OrderDirection.SELL}>Sell</MenuItem>
        </Select>

        <Select
          value={formData.orderType}
          onChange={(e) =>
            onChangeData({
              orderType: Number(e.target.value)
            })
          }
          sx={{
            minWidth: 160,
            background: '#262A33',
            color: '#F3F4F6',
            borderRadius: '8px'
          }}
          size='small'
        >
          <MenuItem value={OrderType.LIMIT}>Limit</MenuItem>
          <MenuItem value={OrderType.MARKET}>Market</MenuItem>
        </Select>

        <TextField
          label='Min Price'
          value={formData.minPrice}
          onChange={(e) =>
            onChangeData({
              minPrice: e.target.value
            })
          }
          size='small'
          InputLabelProps={{ style: { color: '#BDC1CA' } }}
          sx={{ input: { color: '#F3F4F6' }, minWidth: 180 }}
        />
        <TextField
          label='Max Price'
          value={formData.maxPrice}
          onChange={(e) =>
            onChangeData({
              maxPrice: e.target.value
            })
          }
          size='small'
          InputLabelProps={{ style: { color: '#BDC1CA' } }}
          sx={{ input: { color: '#F3F4F6' }, minWidth: 180 }}
        />
        <TextField
          label='Amount Out'
          value={formData.amountOut}
          onChange={(e) =>
            onChangeData({
              amountOut: e.target.value
            })
          }
          size='small'
          InputLabelProps={{ style: { color: '#BDC1CA' } }}
          sx={{ input: { color: '#F3F4F6' }, minWidth: 180 }}
        />
        <TextField
          label='Fee Ratio'
          value={formData.feeRatio}
          onChange={(e) =>
            onChangeData({
              feeRatio: e.target.value
            })
          }
          InputLabelProps={{ style: { color: '#BDC1CA' } }}
          sx={{ input: { color: '#F3F4F6' }, minWidth: 160 }}
        />
      </Stack>

      <Stack
        direction='row'
        spacing={2}
        flexWrap='wrap'
      >
        <TextField
          label='Start Date'
          type='datetime-local'
          value={formData.startAt}
          onChange={(e) =>
            onChangeData({
              startAt: e.target.value
            })
          }
          size='small'
          InputLabelProps={{
            shrink: true,
            style: { color: '#BDC1CA' }
          }}
          sx={{ input: { color: '#F3F4F6' }, minWidth: 240 }}
        />
        <TextField
          label='End Date'
          type='datetime-local'
          value={formData.endAt}
          onChange={(e) =>
            onChangeData({
              endAt: e.target.value
            })
          }
          size='small'
          InputLabelProps={{
            shrink: true,
            style: { color: '#BDC1CA' }
          }}
          sx={{ input: { color: '#F3F4F6' }, minWidth: 240 }}
        />
        <TextField
          label='Interval (seconds)'
          value={formData.intervalSeconds}
          onChange={(e) =>
            onChangeData({
              intervalSeconds: e.target.value
            })
          }
          size='small'
          InputLabelProps={{ style: { color: '#BDC1CA' } }}
          sx={{ input: { color: '#F3F4F6' }, minWidth: 180 }}
        />
      </Stack>
    </Stack>
  )
}
