import {
  Button,
  Menu,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import React, { useEffect, useState } from 'react'
import { PlaceOrderModal } from '../Modal/PlaceOrderModal'
import { OrderDto } from 'darkswap-client-core'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { OrderStatusLabel } from '../Label/OrderStatusLabel'
import {
  OrderDirection,
  OrderEvents,
  OrderStatus,
  OrderType
} from '../../types'

import { useAssetPairContext } from '../../contexts/AssetPairContext/hooks'
import { ethers } from 'ethers'
import { NetworkLabel } from '../Label/NetworkLabel'
import { useConfigContext } from '../../contexts/ConfigContext/hooks'

const orderType = (type: OrderType) => {
  switch (type) {
    case OrderType.LIMIT:
      return 'Limit'
    case OrderType.MARKET:
      return 'Market'
    case OrderType.STOP_LOSS_LIMIT:
      return 'Stop Loss Limit'
    case OrderType.TAKE_PROFIT_LIMIT:
      return 'Take Profit Limit'
    case OrderType.STOP_LOSS:
      return 'Stop Loss'
    case OrderType.TAKE_PROFIT:
      return 'Take Profit'
    default:
      return 'Unknown'
  }
}

export const OrderContent = () => {
  const [openModal, setOpenModal] = React.useState(false)
  const [listData, setListData] = useState<OrderEvents[]>([])
  const { list } = useAssetPairContext()
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10
  })

  const [loading, setLoading] = useState<string | boolean>(false)
  const { isAuthenticated } = useConfigContext()
  const { chainId } = useChainContext()

  const onOpenModal = () => {
    setOpenModal(true)
  }

  const onCloseModal = () => {
    if (!chainId) return
    fetchOrders(chainId, pagination.page, pagination.limit)
    setOpenModal(false)
  }

  const fetchOrders = async (chainId: number, page: number, limit: number) => {
    // @ts-ignore
    const orders = await window.orderAPI.getAllOrders(chainId, page, limit)
    console.log('Fetched orders:', orders)
    setListData(orders)
  }

  useEffect(() => {
    if (!chainId) return
    fetchOrders(chainId, pagination.page, pagination.limit)
  }, [chainId, pagination.page, pagination.limit])

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

  const formatAmountIn = (row: OrderDto) => {
    const assetPair = list.find((ap) => ap.id === row.assetPairId)
    if (!assetPair) return row.amountIn.toString()

    const decimalIn =
      row.orderDirection === OrderDirection.SELL
        ? assetPair.quoteDecimal
        : assetPair.baseDecimal
    const result = ethers.formatUnits(row.amountIn, decimalIn)
    return result
  }

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    value: number
  ) => {
    console.log('Page changed to:', value)
    setPagination((prev) => ({ ...prev, page: value + 1 }))
  }

  console.log('Rendering OrderContent with listData:', pagination, listData)

  const listStatuses = new Array<OrderStatus>(
    OrderStatus.OPEN,
    OrderStatus.MATCHED,
    OrderStatus.CANCELLED,
    OrderStatus.SETTLED,
    OrderStatus.NOT_TRIGGERED,
    OrderStatus.TRIGGERED,
    OrderStatus.BOB_CONFIRMED
  )

  const onCancelOrder = async (order: OrderDto) => {
    try {
      setLoading(order.orderId)
      // @ts-ignore
      await window.orderAPI.cancelOrder({
        chainId: order.chainId,
        wallet: order.wallet,
        orderId: order.orderId
      })
      fetchOrders(order.chainId, pagination.page, pagination.limit)
    } catch (error) {
      console.error('Error cancelling order:', error)
    } finally {
      setLoading(false)
    }
  }

  const isCancelable = (status?: OrderStatus) => {
    if (status === undefined) return false
    return status === OrderStatus.OPEN || status === OrderStatus.NOT_TRIGGERED
  }

  return (
    <Stack mt={2}>
      <Stack
        width={'100%'}
        direction={'row'}
        justifyContent={'flex-end'}
      >
        <Button
          variant='contained'
          sx={{
            background: '#68EB8E',
            color: '#0A0A0A',
            textTransform: 'capitalize',
            borderRadius: '10px'
          }}
          startIcon={<AddIcon />}
          onClick={onOpenModal}
          disabled={!!loading || !isAuthenticated}
        >
          Place Order
        </Button>
      </Stack>
      {/* Table */}
      <TableContainer
        sx={{
          background: '#1E2128',
          borderRadius: '10px',
          mt: 2,
          maxHeight: '640px',
          overflowY: 'auto'
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
              <TableCell>Date</TableCell>
              <TableCell>Pair Id</TableCell>
              <TableCell>Direction</TableCell>
              <TableCell align='center'>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Network</TableCell>
              <TableCell>Action</TableCell>
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
                      fontSize: '14px',
                      paddingTop: '8px'
                    }
                  }}
                >
                  <TableCell>{row.events[0].createdAt.toString()}</TableCell>
                  <TableCell>{row.assetPairId}</TableCell>
                  <TableCell>
                    {row.orderDirection === OrderDirection.BUY ? 'Buy' : 'Sell'}
                  </TableCell>
                  <TableCell align='center'>
                    <OrderStatusLabel status={row.events[0].status} />
                  </TableCell>
                  <TableCell>{orderType(row.orderType)}</TableCell>
                  <TableCell>{formatAmountOut(row)}</TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{formatAmountIn(row)}</TableCell>
                  <TableCell>
                    <NetworkLabel chainId={row.chainId} />
                  </TableCell>
                  <TableCell>
                    {isCancelable(row.events[0].status) && (
                      <Button
                        variant='outlined'
                        color='error'
                        sx={{
                          textTransform: 'capitalize',
                          borderRadius: '8px',
                          fontSize: '12px',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 77, 77, 0.1)',
                            borderColor: '#FF4D4D'
                          },
                          '&.Mui-disabled': {
                            border: 'none'
                          },
                          '& .MuiCircularProgress-root': {
                            color: '#68EB8E'
                          }
                        }}
                        onClick={() => onCancelOrder(row)}
                        disabled={!!loading || !isAuthenticated}
                        loading={loading === row.orderId}
                      >
                        {'Cancel'}
                      </Button>
                    )}
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
                  colSpan={7}
                  align='center'
                  sx={{
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}

            {/* Add more rows as needed */}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        mt={1}
        alignItems='center'
      >
        <TablePagination
          component='div'
          count={-1} // Unknown total count
          page={pagination.page - 1}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={(event) =>
            setPagination((prev) => ({
              ...prev,
              limit: parseInt(event.target.value, 10),
              page: 1
            }))
          }
          rowsPerPageOptions={[5, 10]}
          sx={{
            color: 'white'
          }}
          slotProps={{
            actions: {
              nextButton: {
                disabled: listData.length < pagination.limit
              }
            }
          }}
        />
      </Stack>
      <PlaceOrderModal
        open={openModal}
        onClose={onCloseModal}
      />
    </Stack>
  )
}
