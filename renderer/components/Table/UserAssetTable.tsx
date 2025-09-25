import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material'
import { shorterAddress } from '../../utils/format'

function createData(
  asset: string,
  contractAddress: string,
  holder: string,
  balance: number
) {
  return { asset, contractAddress, holder, balance }
}

const rows = [
  createData(
    'USDT',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    '0x742d35Cc6528C471c6d926606207e0C5af922D5e',
    1250.5
  ),
  createData(
    'USDC',
    '0xA0b86a33E6441Bc23f4C4A6b7F8A5f9e3A9C8F12',
    '0x8Ba1f109551bD432803012645Hac136c22C3BA93',
    850.75
  ),
  createData(
    'WETH',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    2.45
  ),
  createData(
    'DAI',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    '0x742d35Cc6528C471c6d926606207e0C5af922D5e',
    3200.0
  ),
  createData(
    'LINK',
    '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    95.25
  )
]

export function UserAssetTable() {
  return (
    <TableContainer
      component={Paper}
      sx={{ background: 'none', boxShadow: 'none', border: 'none' }}
    >
      <Table
        sx={{
          minWidth: 650,
          background: '#1E2128',
          borderRadius: '20px'
        }}
        aria-label='simple table'
      >
        <TableHead>
          <TableRow sx={{ th: { border: 0 } }}>
            <StyledTableCell>Asset</StyledTableCell>
            <StyledTableCell align='center'>Contract Address</StyledTableCell>
            <StyledTableCell align='center'>Holder</StyledTableCell>
            <StyledTableCell align='right'>Balance</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              sx={{ 'td, th': { border: 0 } }}
            >
              <StyledTableCell
                component='th'
                scope='row'
              >
                {row.asset}
              </StyledTableCell>
              <StyledTableCell align='center'>
                {shorterAddress(row.contractAddress)}
              </StyledTableCell>
              <StyledTableCell align='center'>
                {shorterAddress(row.holder)}
              </StyledTableCell>
              <StyledTableCell align='right'>{row.balance}</StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: '#F3F4F6'
}))
