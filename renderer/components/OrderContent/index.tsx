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
import React from 'react'
import { PlaceOrderModal } from '../Modal/PlaceOrderModal'

const rows = [
  {
    action: 'Buy',
    status: 'Open',
    type: 'Limit',
    amount: '0.5 BTC',
    price: '$30,000',
    total: '$15,000',
    network: 'Bitcoin'
  },
  {
    action: 'Sell',
    status: 'Completed',
    type: 'Market',
    amount: '1 ETH',
    price: '$2,000',
    total: '$2,000',
    network: 'Ethereum'
  },
  {
    action: 'Buy',
    status: 'Cancelled',
    type: 'Limit',
    amount: '100 ADA',
    price: '$1.20',
    total: '$120',
    network: 'Cardano'
  }
]

export const OrderContent = () => {
  const [openModal, setOpenModal] = React.useState(false)

  const onOpenModal = () => {
    setOpenModal(true)
  }

  const onCloseModal = () => {
    setOpenModal(false)
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
              <TableCell>Action</TableCell>
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
            {rows.map((row, index) => (
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
                <TableCell>{row.action}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell>{row.total}</TableCell>
                <TableCell>{row.network}</TableCell>
              </TableRow>
            ))}

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
