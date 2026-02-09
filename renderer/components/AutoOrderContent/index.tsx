import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { useAssetPairContext } from '../../contexts/AssetPairContext/hooks'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { useToast } from '../../contexts/ToastContext'
import {
  AutoOrderJobDto,
  AutoOrderJobStatus,
  OrderDirection,
  OrderType,
  SortType,
  StpMode,
  TimeInForce
} from '../../types'
import AccountSelection from '../Selection/AccountSelection'
import NetworkSelection from '../Selection/NetworkSelection'

const statusLabel = (status?: AutoOrderJobStatus) => {
  switch (status) {
    case AutoOrderJobStatus.ACTIVE:
      return 'Active'
    case AutoOrderJobStatus.PAUSED:
      return 'Paused'
    case AutoOrderJobStatus.COMPLETED:
      return 'Completed'
    case AutoOrderJobStatus.CANCELLED:
      return 'Cancelled'
    default:
      return 'Unknown'
  }
}

const formatDate = (value?: number | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

export const AutoOrderContent = () => {
  const { chainId, currentChain, onChangeChain } = useChainContext()
  const { selectedAccount, setSelectedAccount } = useAccountContext()
  const { list, assetPair, onChangeAssetPair } = useAssetPairContext()
  const { showError, showLoading, hideToast, showSuccess } = useToast()

  const [formData, setFormData] = useState({
    minPrice: '',
    maxPrice: '',
    amountOut: '',
    feeRatio: '0.001',
    startAt: '',
    endAt: '',
    intervalSeconds: '15',
    orderDirection: OrderDirection.SELL,
    orderType: OrderType.LIMIT
  })

  const [pagination, setPagination] = useState({ page: 1, limit: 10 })
  const [jobs, setJobs] = useState<AutoOrderJobDto[]>([])
  const [totalJobs, setTotalJobs] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<AutoOrderJobStatus | 'all'>(
    'all'
  )

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<AutoOrderJobDto | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    assetPairId: '',
    orderDirection: OrderDirection.SELL,
    orderType: OrderType.LIMIT,
    minPrice: '',
    maxPrice: '',
    amountOut: '',
    feeRatio: '0.001',
    startAt: '',
    endAt: '',
    intervalSeconds: '15'
  })

  const selectedPair = assetPair

  const canSubmit = useMemo(() => {
    return (
      !!chainId &&
      !!selectedAccount &&
      !!selectedPair &&
      formData.minPrice !== '' &&
      formData.maxPrice !== '' &&
      formData.amountOut !== '' &&
      Number(formData.intervalSeconds) > 0
    )
  }, [chainId, selectedAccount, selectedPair, formData])

  const fetchJobs = async () => {
    if (!chainId) return
    setLoading(true)
    try {
      // @ts-ignore
      const result = await window.autoOrderAPI.getJobsByPage(
        chainId,
        pagination.page,
        pagination.limit,
        SortType.NEWEST,
        filterStatus === 'all' ? undefined : filterStatus,
        debouncedSearch.trim() === '' ? undefined : debouncedSearch.trim()
      )
      setJobs(result.jobs || [])
      setTotalJobs(result.total || 0)
    } catch (error) {
      console.error('Failed to fetch auto order jobs', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchJobs()
  }, [
    chainId,
    pagination.page,
    pagination.limit,
    filterStatus,
    debouncedSearch
  ])

  const toDateTimeInput = (value?: number | null) => {
    if (!value) return ''
    return new Date(value).toISOString().slice(0, 16)
  }

  const openDetail = (job: AutoOrderJobDto) => {
    setSelectedJob(job)
    setEditForm({
      assetPairId: job.assetPairId,
      orderDirection: job.orderDirection,
      orderType: job.orderType,
      minPrice: job.minPrice,
      maxPrice: job.maxPrice,
      amountOut: job.amountOut,
      feeRatio: job.feeRatio,
      startAt: toDateTimeInput(job.startAt),
      endAt: toDateTimeInput(job.endAt),
      intervalSeconds: job.intervalSeconds.toString()
    })
    setEditMode(false)
    setDetailOpen(true)
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setSelectedJob(null)
    setEditMode(false)
  }

  const onCreateJob = async () => {
    if (!chainId || !selectedAccount || !selectedPair) return
    if (!canSubmit) {
      showError('Please fill in all required fields')
      return
    }

    const toastId = showLoading('Creating auto order job...')
    try {
      const startAt = formData.startAt
        ? new Date(formData.startAt).getTime()
        : Date.now()
      const endAt = formData.endAt
        ? new Date(formData.endAt).getTime()
        : undefined

      if (endAt && endAt <= startAt) {
        showError('End date must be after start date')
        hideToast(toastId)
        return
      }

      const payload: AutoOrderJobDto = {
        jobId: crypto.randomUUID(),
        chainId,
        wallet: selectedAccount.address,
        assetPairId: selectedPair.id,
        orderDirection: formData.orderDirection,
        orderType: formData.orderType,
        timeInForce: TimeInForce.GTC,
        stpMode: StpMode.NONE,
        minPrice: formData.minPrice,
        maxPrice: formData.maxPrice,
        amountOut: formData.amountOut,
        feeRatio: formData.feeRatio,
        startAt,
        endAt,
        intervalSeconds: Number(formData.intervalSeconds),
        status: AutoOrderJobStatus.ACTIVE
      }

      // @ts-ignore
      await window.autoOrderAPI.createJob(payload)

      showSuccess('Auto order job created')
      setFormData((prev) => ({
        ...prev,
        minPrice: '',
        maxPrice: '',
        amountOut: ''
      }))
      fetchJobs()
    } catch (error) {
      console.error('Create job failed', error)
      showError('Failed to create job')
    } finally {
      hideToast(toastId)
    }
  }

  const onPause = async (jobId: string) => {
    const toastId = showLoading('Pausing job...')
    try {
      // @ts-ignore
      await window.autoOrderAPI.pauseJob(jobId)
      showSuccess('Job paused')
      fetchJobs()
    } catch (error) {
      console.error('Pause job failed', error)
      showError('Failed to pause job')
    } finally {
      hideToast(toastId)
    }
  }

  const onResume = async (jobId: string) => {
    const toastId = showLoading('Resuming job...')
    try {
      // @ts-ignore
      await window.autoOrderAPI.resumeJob(jobId)
      showSuccess('Job resumed')
      fetchJobs()
    } catch (error) {
      console.error('Resume job failed', error)
      showError('Failed to resume job')
    } finally {
      hideToast(toastId)
    }
  }

  const onCancel = async (jobId: string) => {
    const toastId = showLoading('Cancelling job...')
    try {
      // @ts-ignore
      await window.autoOrderAPI.cancelJob(jobId)
      showSuccess('Job cancelled')
      fetchJobs()
    } catch (error) {
      console.error('Cancel job failed', error)
      showError('Failed to cancel job')
    } finally {
      hideToast(toastId)
    }
  }

  const onUpdateJob = async () => {
    if (!selectedJob || !chainId) return

    const toastId = showLoading('Updating job...')
    try {
      const startAt = editForm.startAt
        ? new Date(editForm.startAt).getTime()
        : Date.now()
      const endAt = editForm.endAt
        ? new Date(editForm.endAt).getTime()
        : undefined

      if (endAt && endAt <= startAt) {
        showError('End date must be after start date')
        hideToast(toastId)
        return
      }

      const payload: AutoOrderJobDto = {
        ...selectedJob,
        assetPairId: editForm.assetPairId,
        orderDirection: editForm.orderDirection,
        orderType: editForm.orderType,
        timeInForce: TimeInForce.GTC,
        stpMode: StpMode.NONE,
        minPrice: editForm.minPrice,
        maxPrice: editForm.maxPrice,
        amountOut: editForm.amountOut,
        feeRatio: editForm.feeRatio,
        startAt,
        endAt,
        intervalSeconds: Number(editForm.intervalSeconds)
      }

      // @ts-ignore
      const updated = await window.autoOrderAPI.updateJob(payload)
      showSuccess('Job updated')
      setSelectedJob(updated)
      setEditMode(false)
      fetchJobs()
    } catch (error) {
      console.error('Update job failed', error)
      showError('Failed to update job')
    } finally {
      hideToast(toastId)
    }
  }

  const isEditable =
    selectedJob &&
    selectedJob.status !== AutoOrderJobStatus.CANCELLED &&
    selectedJob.status !== AutoOrderJobStatus.COMPLETED &&
    !selectedJob.activeOrderId

  return (
    <Stack spacing={3}>
      <Stack
        spacing={2}
        sx={{
          background: '#1E2128',
          padding: 2,
          borderRadius: '16px'
        }}
      >
        <Typography
          variant='h6'
          color='#F3F4F6'
        >
          Create Auto Order Job
        </Typography>

        <Stack
          direction='row'
          spacing={2}
          flexWrap='wrap'
        >
          <NetworkSelection
            selectedNetwork={currentChain}
            onNetworkChange={onChangeChain}
            buttonSx={{ border: '1px solid #3A3E47' }}
          />
          <AccountSelection
            selectedAccount={selectedAccount || undefined}
            onAccountChange={(account) => setSelectedAccount(account)}
            buttonSx={{ border: '1px solid #3A3E47' }}
          />
          <Select
            value={selectedPair?.id || ''}
            onChange={(e) => {
              const pair = list.find((p) => p.id === e.target.value)
              if (pair && onChangeAssetPair) onChangeAssetPair(pair)
            }}
            displayEmpty
            sx={{
              minWidth: 220,
              background: '#262A33',
              color: '#F3F4F6',
              borderRadius: '8px'
            }}
          >
            <MenuItem value=''>Select Asset Pair</MenuItem>
            {list.map((pair) => (
              <MenuItem
                key={pair.id}
                value={pair.id}
              >
                {pair.baseSymbol}/{pair.quoteSymbol}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        <Stack
          direction='row'
          spacing={2}
          flexWrap='wrap'
        >
          <Select
            value={formData.orderDirection}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                orderDirection: Number(e.target.value)
              }))
            }
            sx={{
              minWidth: 160,
              background: '#262A33',
              color: '#F3F4F6',
              borderRadius: '8px'
            }}
          >
            <MenuItem value={OrderDirection.BUY}>Buy</MenuItem>
            <MenuItem value={OrderDirection.SELL}>Sell</MenuItem>
          </Select>

          <Select
            value={formData.orderType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                orderType: Number(e.target.value)
              }))
            }
            sx={{
              minWidth: 160,
              background: '#262A33',
              color: '#F3F4F6',
              borderRadius: '8px'
            }}
          >
            <MenuItem value={OrderType.LIMIT}>Limit</MenuItem>
            <MenuItem value={OrderType.MARKET}>Market</MenuItem>
          </Select>

          <TextField
            label='Min Price'
            value={formData.minPrice}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                minPrice: e.target.value
              }))
            }
            InputLabelProps={{ style: { color: '#BDC1CA' } }}
            sx={{ input: { color: '#F3F4F6' }, minWidth: 180 }}
          />
          <TextField
            label='Max Price'
            value={formData.maxPrice}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                maxPrice: e.target.value
              }))
            }
            InputLabelProps={{ style: { color: '#BDC1CA' } }}
            sx={{ input: { color: '#F3F4F6' }, minWidth: 180 }}
          />
          <TextField
            label='Amount Out'
            value={formData.amountOut}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amountOut: e.target.value
              }))
            }
            InputLabelProps={{ style: { color: '#BDC1CA' } }}
            sx={{ input: { color: '#F3F4F6' }, minWidth: 180 }}
          />
          <TextField
            label='Fee Ratio'
            value={formData.feeRatio}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                feeRatio: e.target.value
              }))
            }
            InputLabelProps={{ style: { color: '#BDC1CA' } }}
            sx={{ input: { color: '#F3F4F6' }, minWidth: 160 }}
          />
        </Stack>

        <Stack
          direction='row'
          spacing={2}
          flexWrap='wrap'
        >
          <TextField
            label='Start Date'
            type='datetime-local'
            value={formData.startAt}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                startAt: e.target.value
              }))
            }
            InputLabelProps={{
              shrink: true,
              style: { color: '#BDC1CA' }
            }}
            sx={{ input: { color: '#F3F4F6' }, minWidth: 240 }}
          />
          <TextField
            label='End Date'
            type='datetime-local'
            value={formData.endAt}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                endAt: e.target.value
              }))
            }
            InputLabelProps={{
              shrink: true,
              style: { color: '#BDC1CA' }
            }}
            sx={{ input: { color: '#F3F4F6' }, minWidth: 240 }}
          />
          <TextField
            label='Interval (seconds)'
            value={formData.intervalSeconds}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                intervalSeconds: e.target.value
              }))
            }
            InputLabelProps={{ style: { color: '#BDC1CA' } }}
            sx={{ input: { color: '#F3F4F6' }, minWidth: 180 }}
          />
        </Stack>

        <Box>
          <Button
            variant='contained'
            sx={{ background: '#68EB8E', color: '#0C1114' }}
            onClick={onCreateJob}
            disabled={!canSubmit}
          >
            Create Job
          </Button>
        </Box>
      </Stack>

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
          sx={{ mb: 2, width: '100%' }}
        >
          <TextField
            label='Search'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            sx={{ input: { color: '#F3F4F6' }, minWidth: 200 }}
          />
          <Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as AutoOrderJobStatus | 'all')
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
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
                      {job.orderDirection === OrderDirection.BUY
                        ? 'Buy'
                        : 'Sell'}
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
            setPagination((prev) => ({ ...prev, page: newPage + 1 }))
          }
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={(e) =>
            setPagination({ page: 1, limit: parseInt(e.target.value, 10) })
          }
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ color: '#BDC1CA' }}
        />
      </TableContainer>

      <Dialog
        open={detailOpen}
        onClose={closeDetail}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Auto Order Job Details</DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Stack
              spacing={2}
              sx={{ mt: 1 }}
            >
              <Stack spacing={1}>
                <Typography variant='body2'>
                  Job ID: {selectedJob.jobId}
                </Typography>
                <Typography variant='body2'>
                  Wallet: {selectedJob.wallet}
                </Typography>
                <Typography variant='body2'>
                  Status: {statusLabel(selectedJob.status)}
                </Typography>
                <Typography variant='body2'>
                  Active Order: {selectedJob.activeOrderId || '-'}
                </Typography>
                <Typography variant='body2'>
                  Last Run: {formatDate(selectedJob.lastRunAt)}
                </Typography>
              </Stack>

              {!isEditable && (
                <Typography
                  color='error'
                  variant='body2'
                >
                  Job cannot be edited while it is completed/cancelled or has an
                  active order.
                </Typography>
              )}

              <Stack
                direction='row'
                spacing={2}
                flexWrap='wrap'
              >
                <Select
                  value={editForm.assetPairId}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      assetPairId: e.target.value
                    }))
                  }
                  disabled={!editMode}
                  sx={{ minWidth: 220 }}
                >
                  {list.map((pair) => (
                    <MenuItem
                      key={pair.id}
                      value={pair.id}
                    >
                      {pair.baseSymbol}/{pair.quoteSymbol}
                    </MenuItem>
                  ))}
                </Select>

                <Select
                  value={editForm.orderDirection}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      orderDirection: Number(e.target.value)
                    }))
                  }
                  disabled={!editMode}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value={OrderDirection.BUY}>Buy</MenuItem>
                  <MenuItem value={OrderDirection.SELL}>Sell</MenuItem>
                </Select>

                <Select
                  value={editForm.orderType}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      orderType: Number(e.target.value)
                    }))
                  }
                  disabled={!editMode}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value={OrderType.LIMIT}>Limit</MenuItem>
                  <MenuItem value={OrderType.MARKET}>Market</MenuItem>
                </Select>
              </Stack>

              <Stack
                direction='row'
                spacing={2}
                flexWrap='wrap'
              >
                <TextField
                  label='Min Price'
                  value={editForm.minPrice}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      minPrice: e.target.value
                    }))
                  }
                  disabled={!editMode}
                />
                <TextField
                  label='Max Price'
                  value={editForm.maxPrice}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      maxPrice: e.target.value
                    }))
                  }
                  disabled={!editMode}
                />
                <TextField
                  label='Amount Out'
                  value={editForm.amountOut}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      amountOut: e.target.value
                    }))
                  }
                  disabled={!editMode}
                />
                <TextField
                  label='Fee Ratio'
                  value={editForm.feeRatio}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      feeRatio: e.target.value
                    }))
                  }
                  disabled={!editMode}
                />
              </Stack>

              <Stack
                direction='row'
                spacing={2}
                flexWrap='wrap'
              >
                <TextField
                  label='Start Date'
                  type='datetime-local'
                  value={editForm.startAt}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      startAt: e.target.value
                    }))
                  }
                  disabled={!editMode}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label='End Date'
                  type='datetime-local'
                  value={editForm.endAt}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      endAt: e.target.value
                    }))
                  }
                  disabled={!editMode}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label='Interval (seconds)'
                  value={editForm.intervalSeconds}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      intervalSeconds: e.target.value
                    }))
                  }
                  disabled={!editMode}
                />
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Close</Button>
          {selectedJob && (
            <Button
              variant='outlined'
              onClick={() => setEditMode((prev) => !prev)}
              disabled={!isEditable}
            >
              {editMode ? 'Cancel Edit' : 'Edit'}
            </Button>
          )}
          {editMode && (
            <Button
              variant='contained'
              onClick={onUpdateJob}
            >
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
