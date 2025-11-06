import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import React, { useEffect, useState } from 'react'
import { PlaceOrderModal } from '../Modal/PlaceOrderModal'
import { OrderDto } from 'darkswap-client-core'
import { useChainContext } from '../../contexts/ChainContext/hooks'

export const OrderContent = () => {
  const [openModal, setOpenModal] = React.useState(false)
  const [listData, setListData] = useState<OrderDto[]>([])

  const { chainId } = useChainContext()

  const onOpenModal = () => {
    setOpenModal(true)
  }

  const onCloseModal = () => {
    setOpenModal(false)
  }

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
              <TableCell>Status</TableCell>
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
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.orderType}</TableCell>
                  <TableCell>{row.amountOut}</TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{row.amountIn}</TableCell>
                  <TableCell>{row.chainId}</TableCell>
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

      <PlaceOrderModal
        open={openModal}
        onClose={onCloseModal}
      />
    </Stack>
  )
}
