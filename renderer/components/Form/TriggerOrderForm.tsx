import { Button, InputBase, Stack, Typography } from '@mui/material'
import NetworkSelection from '../Selection/NetworkSelection'
import { useEffect, useState } from 'react'
import {
  AssetPairDto,
  Network,
  OrderDirection,
  OrderType,
  StpMode,
  TimeInForce,
  Token
} from '../../types'
import { Label } from '../Label'
import { LabelAssetAmountInput } from '../Input/LabelAssetAmountInput'
import { tokenConfig } from '../../constants/tokenConfig'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import { IOSSwitchButton } from '../Button/IOSSwitchButton'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { getMarketPriceFromBinance } from '../../services/orderService'
import { safeAmountWithDecimals } from '../../utils/safeAmount'
import { OrderDto } from 'darkswap-client-core'
import { ethers } from 'ethers'

export const TriggerOrderForm = () => {
  const { chainId, currentChain, onChangeChain } = useChainContext()
  const { selectedAccount } = useAccountContext()
  const [formData, setFormData] = useState<{
    amountIn: string
    amountOut: string
    price: string
    assetIn: Token | undefined
    assetOut: Token | undefined
    useMarketPrice: boolean
    orderDirection: OrderDirection
    triggerPrice: string
  }>({
    amountIn: '',
    amountOut: '',
    price: '',
    assetIn: undefined,
    assetOut: undefined,
    useMarketPrice: false,
    orderDirection: OrderDirection.SELL,
    triggerPrice: ''
  })

  const [assetPair, setAssetPair] = useState<AssetPairDto>()

  const fetchAssetPairs = async (chainId: number) => {
    // @ts-ignore
    const assetPairs = (await window.assetPairAPI.getAssetPairs(
      chainId
    )) as AssetPairDto[]

    const currentPair = assetPairs[0]
    if (!currentPair) return
    setAssetPair(currentPair)
    setFormData((prev) => ({
      ...prev,
      assetIn: {
        address: currentPair.baseAddress,
        decimals: currentPair.baseDecimal,
        symbol: currentPair.baseSymbol
      },
      assetOut: {
        address: currentPair.quoteAddress,
        decimals: currentPair.quoteDecimal,
        symbol: currentPair.quoteSymbol
      }
    }))
  }

  const fetchMarketPrice = async (assetPair: AssetPairDto) => {
    const price = await getMarketPriceFromBinance(
      assetPair.baseSymbol + assetPair.quoteSymbol
    )
    setFormData((prev) => ({
      ...prev,
      price: parseFloat(price).toFixed(2)
    }))
  }

  useEffect(() => {
    if (!assetPair) return
    fetchMarketPrice(assetPair)
  }, [assetPair])

  useEffect(() => {
    if (!chainId) return
    fetchAssetPairs(chainId)
  }, [chainId])

  useEffect(() => {
    if (formData.amountIn && formData.price && formData.assetOut) {
      const amountOut = safeAmountWithDecimals(
        (parseFloat(formData.amountIn) * parseFloat(formData.price)).toString(),
        formData.assetOut.decimals
      )
      setFormData((prev) => ({
        ...prev,
        amountOut
      }))
    }
  }, [formData.amountIn, formData.price])

  const onPlaceOrder = async () => {
    if (
      !selectedAccount ||
      !chainId ||
      !assetPair ||
      !formData.assetIn ||
      !formData.assetOut
    )
      return
    const amountInBN = ethers
      .parseUnits(formData.amountIn, formData.assetIn.decimals)
      .toString()
    const amountOutBN = ethers
      .parseUnits(formData.amountOut, formData.assetOut.decimals)
      .toString()

    const params: OrderDto = {
      orderId: crypto.randomUUID(),
      wallet: selectedAccount,
      chainId: chainId,
      assetPairId: assetPair.id,
      orderDirection: formData.orderDirection,
      orderType: OrderType.LIMIT,
      timeInForce: TimeInForce.GTC,
      stpMode: StpMode.NONE,
      price: formData.price,
      amountOut: amountOutBN,
      amountIn: amountInBN,
      feeRatio: '0.001'
    }

    console.log('Placing order with params:', params)
    // @ts-ignore
    await window.orderAPI.createOrder(params)
  }

  const switchAsset = () => {
    setFormData((prev) => ({
      ...prev,
      assetIn: prev.assetOut,
      assetOut: prev.assetIn,
      orderDirection:
        prev.orderDirection === OrderDirection.BUY
          ? OrderDirection.SELL
          : OrderDirection.BUY,
      amountIn: prev.amountOut,
      amountOut: prev.amountIn
    }))
  }

  return (
    <Stack>
      <NetworkSelection
        selectedNetwork={currentChain}
        onNetworkChange={onChangeChain}
        buttonSx={{
          border: '1px solid #3A3E47'
        }}
        fullWidth
      />

      {/* Limit Price */}
      <Stack
        direction='row'
        alignItems={'center'}
        justifyContent={'space-between'}
        sx={{
          background: '#262A33',
          borderRadius: '8px',
          p: '4px 12px',
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
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
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

      {/* Trigger Price */}
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
        <Typography color='#F3F4F6B8'>Trigger Price</Typography>
        <Stack
          direction={'row'}
          spacing={1}
          alignItems='center'
        >
          <InputBase
            placeholder='Amount'
            value={formData.triggerPrice}
            onChange={(e) =>
              setFormData({ ...formData, triggerPrice: e.target.value })
            }
            // text right to left for input
            sx={{
              color: '#F3F4F6B8',
              direction: 'rtl'
            }}
          />
          <Typography color='#F3F4F6B8'>{assetPair?.id}</Typography>
        </Stack>
      </Stack>

      <LabelAssetAmountInput
        label='You sell'
        token={formData.assetIn?.address}
        amount={formData.amountIn}
        onChange={(amount) =>
          setFormData((prev) => ({
            ...prev,
            amountIn: amount
          }))
        }
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
        token={formData.assetOut?.address}
        amount={formData.amountOut}
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
