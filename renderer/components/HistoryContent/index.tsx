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

const rows = [
  {
    createdAt: '2023-10-01 12:34:56',
    orderId: 'ORD123456',
    assetPair: 'BTC/USD',
    amount: '0.5 BTC',
    price: '$30,000',
    network: 'Bitcoin',
    status: 'Completed'
  },
  {
    createdAt: '2023-10-02 14:20:30',
    orderId: 'ORD123457',
    assetPair: 'ETH/USD',
    amount: '2 ETH',
    price: '$2,000',
    network: 'Ethereum',
    status: 'Pending'
  },
  {
    createdAt: '2023-10-03 09:15:45',
    orderId: 'ORD123458',
    assetPair: 'LTC/USD',
    amount: '10 LTC',
    price: '$150',
    network: 'Litecoin',
    status: 'Failed'
  },
  {
    createdAt: '2023-10-04 11:05:20',
    orderId: 'ORD123459',
    assetPair: 'XRP/USD',
    amount: '500 XRP',
    price: '$0.50',
    network: 'Ripple',
    status: 'Completed'
  }
]

export const HistoryContent = () => {
  return (
    <Stack mt={2}>
      {/* Filter */}

      <Stack
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
              <TableCell>Date</TableCell>
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
                <TableCell>{row.createdAt}</TableCell>
                <TableCell>{row.orderId}</TableCell>
                <TableCell>{row.assetPair}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell>{row.network}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}

            {/* Add more rows as needed */}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
