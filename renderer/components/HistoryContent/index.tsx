import {
  Stack,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Button
} from '@mui/material'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import SwapVertOutlinedIcon from '@mui/icons-material/SwapVertOutlined'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { useEffect, useState } from 'react'
import { MyAssetsDto, OrderDto } from 'darkswap-client-core'
import { OrderStatusLabel } from '../Label/OrderStatusLabel'
import { NetworkLabel } from '../Label/NetworkLabel'
import { useAssetPairContext } from '../../contexts/AssetPairContext/hooks'
import { OrderDirection } from '../../types'
import { ethers } from 'ethers'

export const HistoryContent = () => {
  const { chainId } = useChainContext()
  const [listData, setListData] = useState<OrderDto[]>([])
  const { list } = useAssetPairContext()

  const fetchOrders = async () => {
    const page = 1
    const limit = 50
    // @ts-ignore
    const orders = await window.orderAPI.getAllOrders(0, page, limit)
    console.log('Fetched orders:', orders)
    setListData(orders)
  }

  useEffect(() => {
    fetchOrders()
  }, [chainId])

  const formatAmountOut = (row: OrderDto) => {
    const assetPair = list.find((ap) => ap.id === row.assetPairId)
    if (!assetPair) return row.amountOut.toString()

    const decimalOut =
      row.orderDirection === OrderDirection.SELL
        ? assetPair.baseDecimal
        : assetPair.quoteDecimal
    const result = ethers.formatUnits(row.amountOut, decimalOut)
    return result
  }

  return (
    <Stack mt={2}>
      {/* Filter */}

      {/* <Stack
        width={'100%'}
        direction='row'
        justifyContent='flex-end'
        alignItems='center'
        spacing={1}
      >
        <Button
          variant='contained'
          sx={{
            background: '#161515',
            color: '#fff',
            textTransform: 'capitalize',
            borderRadius: '10px'
          }}
          startIcon={<FilterAltOutlinedIcon />}
        >
          Filter
        </Button>
        <Button
          variant='contained'
          sx={{
            background: '#161515',
            color: '#fff',
            textTransform: 'capitalize',
            borderRadius: '10px'
          }}
          startIcon={<SwapVertOutlinedIcon />}
        >
          Sort
        </Button>
      </Stack> */}
      {/* Table */}
      <TableContainer
        sx={{
          background: '#1E2128',
          borderRadius: '10px',
          mt: 2
        }}
      >
        <Table>
          {/* Table Head */}
          <TableHead>
            <TableRow
              sx={{
                'tr, th, td': {
                  border: 'none',
                  color: '#68EB8E',
                  fontSize: '14px',
                  fontWeight: 700
                }
              }}
            >
              <TableCell>Order Id</TableCell>
              <TableCell>Asset Pair</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Network</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          {/* Table Body */}
          <TableBody>
            {listData.length > 0 ? (
              listData.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    'tr, th, td': {
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }
                  }}
                >
                  <TableCell>{row.orderId}</TableCell>
                  <TableCell>{row.assetPairId}</TableCell>
                  <TableCell>{formatAmountOut(row)}</TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>
                    <NetworkLabel chainId={row.chainId} />
                  </TableCell>
                  <TableCell>
                    <OrderStatusLabel status={row.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow
                sx={{
                  'tr, th, td': {
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }
                }}
              >
                <TableCell
                  colSpan={6}
                  align='center'
                  sx={{ color: '#FFFFFF', fontSize: '14px' }}
                >
                  No order history available.
                </TableCell>
              </TableRow>
            )}

            {/* Add more rows as needed */}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
