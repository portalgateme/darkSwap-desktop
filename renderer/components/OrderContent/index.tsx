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
import { OrderDirection, OrderStatus, OrderType } from '../../types'

import { useAssetPairContext } from '../../contexts/AssetPairContext/hooks'
import { ethers } from 'ethers'
import { NetworkLabel } from '../Label/NetworkLabel'
import { MenuItem } from '@mui/material'

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
  const [listData, setListData] = useState<OrderDto[]>([])
  const { list } = useAssetPairContext()
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    status: OrderStatus.OPEN
  })
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const { chainId } = useChainContext()

  const onOpenModal = () => {
    setOpenModal(true)
  }

  const onCloseModal = () => {
    fetchOrders(pagination.status, pagination.page, pagination.limit)
    setOpenModal(false)
  }

  const fetchOrders = async (
    status: OrderStatus,
    page: number,
    limit: number
  ) => {
    // @ts-ignore
    const orders = await window.orderAPI.getAllOrders(status, page, limit)
    console.log('Fetched orders:', orders)
    setListData(orders)
  }

  useEffect(() => {
    fetchOrders(pagination.status, pagination.page, pagination.limit)
  }, [chainId, pagination.page, pagination.limit, pagination.status])

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
        >
          Place Order
        </Button>
      </Stack>
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
              <TableCell>
                <Button
                  variant='text'
                  onClick={(event) => setAnchorEl(event.currentTarget)}
                  sx={{
                    color: '#68EB8E',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(104, 235, 142, 0.1)'
                    }
                  }}
                >
                  Status ▼
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{
                    sx: {
                      backgroundColor: '#2A2D37',
                      border: '1px solid #68EB8E',
                      borderRadius: '8px',
                      minWidth: '120px'
                    }
                  }}
                >
                  {listStatuses.map((status) => (
                    <MenuItem
                      key={status}
                      onClick={() => {
                        setPagination((prev) => ({
                          ...prev,
                          status: status as OrderStatus,
                          page: 1
                        }))
                        setAnchorEl(null)
                      }}
                      sx={{
                        color:
                          pagination.status === status ? '#68EB8E' : '#FFFFFF',
                        '&:hover': {
                          backgroundColor: '#3A3D47'
                        }
                      }}
                    >
                      <OrderStatusLabel status={status} />
                    </MenuItem>
                  ))}
                </Menu>
              </TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Network</TableCell>
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
                  <TableCell>
                    <OrderStatusLabel status={row.status} />
                  </TableCell>
                  <TableCell>{orderType(row.orderType)}</TableCell>
                  <TableCell>{formatAmountOut(row)}</TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{formatAmountIn(row)}</TableCell>
                  <TableCell>
                    <NetworkLabel chainId={row.chainId} />
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
        mt={2}
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
