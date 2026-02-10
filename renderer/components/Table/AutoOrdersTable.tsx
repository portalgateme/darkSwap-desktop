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
  Button
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import {
  AutoOrderJobDto,
  AutoOrderJobStatus,
  OrderDirection
} from '../../types'
import { useAssetPairContext } from '../../contexts/AssetPairContext/hooks'
import { statusLabel } from '../AutoOrderContent'

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
    <TableContainer
      sx={{
        background: '#1E2128',
        borderRadius: '16px',
        padding: 2,
        overflowX: 'auto'
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
        >
          <MenuItem value='all'>All</MenuItem>
          <MenuItem value={AutoOrderJobStatus.ACTIVE}>Active</MenuItem>
          <MenuItem value={AutoOrderJobStatus.PAUSED}>Paused</MenuItem>
          <MenuItem value={AutoOrderJobStatus.COMPLETED}>Completed</MenuItem>
          <MenuItem value={AutoOrderJobStatus.CANCELLED}>Cancelled</MenuItem>
        </Select>
      </Stack>

      <Table size='small'>
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
                      maxWidth: 90,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {job.jobId}
                  </TableCell>
                  <TableCell sx={{ color: '#BDC1CA', maxWidth: 120 }}>
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
                    >
                      {job.status === AutoOrderJobStatus.ACTIVE && (
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={(e) => {
                            e.stopPropagation()
                            onPause(job.jobId)
                          }}
                        >
                          Pause
                        </Button>
                      )}
                      {job.status === AutoOrderJobStatus.PAUSED && (
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={(e) => {
                            e.stopPropagation()
                            onResume(job.jobId)
                          }}
                        >
                          Resume
                        </Button>
                      )}
                      {job.status !== AutoOrderJobStatus.CANCELLED &&
                        job.status !== AutoOrderJobStatus.COMPLETED && (
                          <Button
                            size='small'
                            color='error'
                            variant='outlined'
                            onClick={(e) => {
                              e.stopPropagation()
                              onCancel(job.jobId)
                            }}
                          >
                            Cancel
                          </Button>
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
        rowsPerPageOptions={[5, 10, 25]}
        sx={{ color: '#BDC1CA' }}
      />
    </TableContainer>
  )
}
