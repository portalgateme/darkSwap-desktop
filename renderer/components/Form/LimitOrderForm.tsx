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
import { LabelAssetAmountInput } from '../Input/LabelAssetAmountInput'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import { IOSSwitchButton } from '../Button/IOSSwitchButton'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { getMarketPriceFromBinance } from '../../services/orderService'
import { ethers } from 'ethers'
import { OrderDto } from 'darkswap-client-core'
import { safeAmountWithDecimals } from '../../utils/safeAmount'
import { useAssetPairContext } from '../../contexts/AssetPairContext/hooks'

export const LimitOrderForm = () => {
  const { chainId, currentChain, onChangeChain } = useChainContext()
  const { selectedAccount } = useAccountContext()
  const { assetPair } = useAssetPairContext()

  const [formData, setFormData] = useState<{
    amountIn: string
    amountOut: string
    price: string
    assetIn: Token | undefined
    assetOut: Token | undefined
    useMarketPrice: boolean
    orderDirection: OrderDirection
  }>({
    amountIn: '',
    amountOut: '',
    price: '',
    assetIn: undefined,
    assetOut: undefined,
    useMarketPrice: false,
    orderDirection: OrderDirection.SELL
  })

  const [loading, setLoading] = useState(false)

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
    setFormData((prev) => ({
      ...prev,
      assetIn: {
        address: assetPair.quoteAddress,
        decimals: assetPair.quoteDecimal,
        symbol: assetPair.quoteSymbol
      },
      assetOut: {
        address: assetPair.baseAddress,
        decimals: assetPair.baseDecimal,
        symbol: assetPair.baseSymbol
      },
      orderDirection: OrderDirection.SELL
    }))
  }, [assetPair])

  useEffect(() => {
    if (!assetPair) return
    fetchMarketPrice(assetPair)
  }, [assetPair])

  useEffect(() => {
    if (formData.amountOut && formData.price && formData.assetIn) {
      const amountIn = safeAmountWithDecimals(
        (
          parseFloat(formData.amountOut) * parseFloat(formData.price)
        ).toString(),
        formData.assetIn.decimals
      )
      setFormData((prev) => ({
        ...prev,
        amountIn
      }))
    }
  }, [formData.amountOut, formData.price])

  const onPlaceOrder = async () => {
    if (
      !selectedAccount ||
      !chainId ||
      !assetPair ||
      !formData.assetIn ||
      !formData.assetOut
    )
      return
    setLoading(true)
    try {
      const amountInBN = ethers
        .parseUnits(formData.amountIn, formData.assetIn.decimals)
        .toString()
      const amountOutBN = ethers
        .parseUnits(formData.amountOut, formData.assetOut.decimals)
        .toString()
      const partialAmountInBN = (
        ethers.parseUnits(formData.amountIn, formData.assetIn.decimals) /
        BigInt(100)
      ).toString() // 1% of amountIn

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
        partialAmountIn: partialAmountInBN,
        feeRatio: '0.001'
      }

      console.log('Placing order with params:', params)
      // @ts-ignore
      await window.orderAPI.createOrder(params)
    } catch (error) {
      console.error('Error placing order:', error)
    } finally {
      setLoading(false)
    }
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
          <Typography color='#F3F4F6B8'>{assetPair?.id}</Typography>
        </Stack>
      </Stack>

      <LabelAssetAmountInput
        label='You sell'
        token={formData.assetOut?.address}
        amount={formData.amountOut}
        onChange={(amount) =>
          setFormData((prev) => ({
            ...prev,
            amountOut: amount
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
          onClick={switchAsset}
        />
      </Stack>

      <LabelAssetAmountInput
        label='You buy'
        token={formData.assetIn?.address}
        amount={formData.amountIn}
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
            1 {assetPair?.baseSymbol} = {formData.price}{' '}
            {assetPair?.quoteSymbol}
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
        disabled={loading}
      >
        Place Order
      </Button>
    </Stack>
  )
}
