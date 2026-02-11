import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Select,
  Button,
  IconButton,
  Paper
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import {
  AutoOrderJobDto,
  AutoOrderJobStatus,
  OrderDirection
} from '../../types'
import { useAssetPairContext } from '../../contexts/AssetPairContext/hooks'
import { statusLabel } from '../AutoOrderContent'
import { Cancel, Pause, PlayArrow } from '@mui/icons-material'

interface AutoOrdersTableProps {
  search: string
  onChangeSearch: (value: string) => void
  filterStatus: AutoOrderJobStatus | 'all'
  onChangeFilterStatus: (value: AutoOrderJobStatus | 'all') => void
  jobs: AutoOrderJobDto[]
  loading: boolean
  totalJobs: number
  pagination: {
    page: number
    limit: number
  }

  onChangePagination: (pagination: { page: number; limit: number }) => void
  openDetail: (job: AutoOrderJobDto) => void
  onPause: (jobId: string) => void
  onResume: (jobId: string) => void
  onCancel: (jobId: string) => void
}

export const AutoOrdersTable = ({
  search,
  onChangeSearch,
  filterStatus,
  onChangeFilterStatus,
  jobs,
  openDetail,
  onPause,
  onResume,
  onCancel,
  loading,
  totalJobs,
  pagination,
  onChangePagination
}: AutoOrdersTableProps) => {
  const { list } = useAssetPairContext()

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onChangeSearch(value)
  }

  const onFilterStatusChange = (
    e: SelectChangeEvent<AutoOrderJobStatus | 'all'>
  ) => {
    const value = e.target.value as AutoOrderJobStatus | 'all'
    onChangeFilterStatus(value)
  }
  return (
    <Stack
      sx={{
        background: '#1E2128',
        borderRadius: '16px',
        padding: 2
      }}
    >
      <Typography
        variant='h6'
        color='#F3F4F6'
        sx={{ mb: 2 }}
      >
        Auto Order Jobs
      </Typography>

      <Stack
        direction='row'
        spacing={2}
        flexWrap='wrap'
        sx={{ mb: 2 }}
      >
        <TextField
          label='Search'
          size='small'
          value={search}
          onChange={onSearch}
          sx={{ input: { color: '#F3F4F6' }, minWidth: 200 }}
        />
        <Select
          value={filterStatus}
          onChange={onFilterStatusChange}
          sx={{
            minWidth: 160,
            background: '#262A33',
            color: '#F3F4F6',
            borderRadius: '8px'
          }}
          size='small'
        >
          <MenuItem value='all'>All</MenuItem>
          <MenuItem value={AutoOrderJobStatus.ACTIVE}>Active</MenuItem>
          <MenuItem value={AutoOrderJobStatus.PAUSED}>Paused</MenuItem>
          <MenuItem value={AutoOrderJobStatus.COMPLETED}>Completed</MenuItem>
          <MenuItem value={AutoOrderJobStatus.CANCELLED}>Cancelled</MenuItem>
        </Select>
      </Stack>

      <Table
        aria-label='simple table'
        size='small'
        sx={{ width: '100%' }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#F3F4F6' }}>Job</TableCell>
            <TableCell sx={{ color: '#F3F4F6' }}>Pair</TableCell>
            <TableCell sx={{ color: '#F3F4F6' }}>Side</TableCell>
            <TableCell sx={{ color: '#F3F4F6' }}>Range</TableCell>
            <TableCell sx={{ color: '#F3F4F6' }}>Amt</TableCell>
            <TableCell sx={{ color: '#F3F4F6' }}>Intv</TableCell>
            <TableCell sx={{ color: '#F3F4F6' }}>Status</TableCell>
            <TableCell sx={{ color: '#F3F4F6' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.length > 0 ? (
            jobs.map((job) => {
              const pair = list.find((p) => p.id === job.assetPairId)
              return (
                <TableRow
                  key={job.jobId}
                  onClick={() => openDetail(job)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell
                    sx={{
                      color: '#BDC1CA',
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {job.jobId}
                  </TableCell>
                  <TableCell sx={{ color: '#BDC1CA' }}>
                    {pair
                      ? `${pair.baseSymbol}/${pair.quoteSymbol}`
                      : job.assetPairId}
                  </TableCell>
                  <TableCell sx={{ color: '#BDC1CA' }}>
                    {job.orderDirection === OrderDirection.BUY ? 'Buy' : 'Sell'}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#BDC1CA',
                      maxWidth: 110,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {job.minPrice}-{job.maxPrice}
                  </TableCell>
                  <TableCell sx={{ color: '#BDC1CA' }}>
                    {job.amountOut}
                  </TableCell>
                  <TableCell sx={{ color: '#BDC1CA' }}>
                    {job.intervalSeconds}s
                  </TableCell>
                  <TableCell sx={{ color: '#BDC1CA' }}>
                    {statusLabel(job.status)}
                  </TableCell>
                  <TableCell sx={{ color: '#BDC1CA' }}>
                    <Stack
                      direction='row'
                      spacing={1}
                      alignItems={'center'}
                    >
                      {job.status === AutoOrderJobStatus.ACTIVE && (
                        <IconButton
                          size='small'
                          aria-label='Pause'
                          onClick={(e) => {
                            e.stopPropagation()
                            onPause(job.jobId)
                          }}
                        >
                          <Pause
                            fontSize='small'
                            sx={{ fill: '#BDC1CA' }}
                          />
                        </IconButton>
                      )}
                      {job.status === AutoOrderJobStatus.PAUSED && (
                        <IconButton
                          size='small'
                          aria-label='Resume'
                          onClick={(e) => {
                            e.stopPropagation()
                            onResume(job.jobId)
                          }}
                        >
                          <PlayArrow
                            fontSize='small'
                            sx={{ fill: '#BDC1CA' }}
                          />
                        </IconButton>
                      )}
                      {job.status !== AutoOrderJobStatus.CANCELLED &&
                        job.status !== AutoOrderJobStatus.COMPLETED && (
                          <IconButton
                            size='small'
                            color='error'
                            aria-label='Cancel'
                            onClick={(e) => {
                              e.stopPropagation()
                              onCancel(job.jobId)
                            }}
                          >
                            <Cancel fontSize='small' />
                          </IconButton>
                        )}
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                sx={{ color: '#BDC1CA', textAlign: 'center' }}
              >
                {loading ? 'Loading...' : 'No jobs found.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination
        component='div'
        count={totalJobs}
        page={pagination.page - 1}
        onPageChange={(_, newPage) =>
          onChangePagination({ ...pagination, page: newPage + 1 })
        }
        rowsPerPage={pagination.limit}
        onRowsPerPageChange={(e) =>
          onChangePagination({ page: 1, limit: parseInt(e.target.value, 10) })
        }
        rowsPerPageOptions={[5]}
        sx={{
          color: '#BDC1CA',
          '&	.MuiTablePagination-toolbar': {
            minHeight: '40px',
            height: '40px'
          }
        }}
        size='small'
      />
    </Stack>
  )
}
