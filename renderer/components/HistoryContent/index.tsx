import {
  Stack,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Button,
  TablePagination
} from '@mui/material'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import SwapVertOutlinedIcon from '@mui/icons-material/SwapVertOutlined'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { useEffect, useState } from 'react'
import { MyAssetsDto, OrderDto, OrderEventDto } from 'darkswap-client-core'
import { OrderStatusLabel } from '../Label/OrderStatusLabel'
import { NetworkLabel } from '../Label/NetworkLabel'
import { useAssetPairContext } from '../../contexts/AssetPairContext/hooks'
import { OrderDirection } from '../../types'
import { ethers } from 'ethers'
import { shorterAddress } from '../../utils/format'

export const HistoryContent = () => {
  const { chainId } = useChainContext()
  const [listData, setListData] = useState<OrderEventDto[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })

  const fetchOrders = async (chainId: number, page: number, limit: number) => {
    // @ts-ignore
    const orders = await window.orderAPI.getOrderEventsByPage(
      chainId,
      page,
      limit
    )
    console.log('Fetched orders:', orders)
    setListData(orders)
  }

  useEffect(() => {
    if (!chainId) return
    fetchOrders(chainId, pagination.page, pagination.limit)
  }, [chainId, pagination.page, pagination.limit])

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage + 1
    }))
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
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Network</TableCell>
              <TableCell>Wallet</TableCell>
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
                  <TableCell>{row.createdAt.toString()}</TableCell>
                  <TableCell>
                    <OrderStatusLabel status={row.status} />
                  </TableCell>

                  <TableCell>
                    <NetworkLabel chainId={row.chainId} />
                  </TableCell>
                  <TableCell>{shorterAddress(row.wallet)}</TableCell>
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
    </Stack>
  )
}
