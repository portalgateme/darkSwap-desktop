import { Button, Stack, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { useAssetPairContext } from '../../contexts/AssetPairContext/hooks'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { useToast } from '../../contexts/ToastContext'
import {
  AutoOrderJobDto,
  AutoOrderJobStatus,
  CreateAutoOrderFormData,
  EditAutoOrderFormData,
  OrderDirection,
  OrderType,
  SortType,
  StpMode,
  TimeInForce
} from '../../types'
import { AutoOrdersTable } from '../Table/AutoOrdersTable'
import { AutoOrderDetailModal } from '../Modal/AutoOrderDetailModal'
import { CreateAutoOrderModal } from '../Modal/CreateAutoOrderModal'

export const formatDate = (value?: number | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

export const statusLabel = (status?: AutoOrderJobStatus) => {
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

export const AutoOrderContent = () => {
  const { chainId } = useChainContext()
  const { selectedAccount } = useAccountContext()
  const { list, assetPair } = useAssetPairContext()
  const { showError, showLoading, hideToast, showSuccess } = useToast()

  const [formData, setFormData] = useState<CreateAutoOrderFormData>({
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

  const [pagination, setPagination] = useState({ page: 1, limit: 5 })
  const [jobs, setJobs] = useState<AutoOrderJobDto[]>([])
  const [totalJobs, setTotalJobs] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<AutoOrderJobStatus | 'all'>(
    'all'
  )

  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<AutoOrderJobDto | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<EditAutoOrderFormData>({
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
  const [selectedWallet, setSelectedWallet] = useState(selectedAccount || null)

  useEffect(() => {
    if (!selectedWallet && selectedAccount) {
      setSelectedWallet(selectedAccount)
    }
  }, [selectedAccount, selectedWallet])

  const canSubmit = useMemo(() => {
    return (
      !!chainId &&
      !!selectedWallet &&
      !!selectedPair &&
      formData.minPrice !== '' &&
      formData.maxPrice !== '' &&
      formData.amountOut !== '' &&
      Number(formData.intervalSeconds) > 0
    )
  }, [chainId, selectedWallet, selectedPair, formData])

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

  const onOpenCreate = () => {
    setCreateOpen(true)
  }

  const onCloseCreate = () => {
    setCreateOpen(false)
  }

  const onCreateJob = async () => {
    if (!chainId || !selectedWallet || !selectedPair) return
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
        wallet: selectedWallet.address,
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
      setCreateOpen(false)
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

  const onChangeData = (data: Partial<CreateAutoOrderFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data
    }))
  }

  const onChangeSearch = (value: string) => {
    setSearch(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const onChangeStatus = (value: AutoOrderJobStatus | 'all') => {
    setFilterStatus(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const onChangeEditForm = (data: Partial<EditAutoOrderFormData>) => {
    setEditForm((prev) => ({
      ...prev,
      ...data
    }))
  }

  const onChangeEditMode = () => {
    setEditMode((prev) => !prev)
  }

  return (
    <Stack
      mt={2}
      spacing={3}
      sx={{ width: '100%' }}
    >
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='flex-end'
      >
        {/* <Stack>
          <Typography
            variant='h5'
            color='#F3F4F6'
          >
            Auto Order Jobs
          </Typography>
          <Typography
            variant='body2'
            color='#BDC1CA'
          >
            Create and manage automated orders by conditions
          </Typography>
        </Stack> */}
        <Button
          variant='contained'
          sx={{ background: '#68EB8E', color: '#0C1114' }}
          onClick={onOpenCreate}
        >
          Create Auto Order
        </Button>
      </Stack>

      <AutoOrdersTable
        search={search}
        onChangeSearch={onChangeSearch}
        filterStatus={filterStatus}
        onChangeFilterStatus={onChangeStatus}
        jobs={jobs}
        openDetail={openDetail}
        onPause={onPause}
        onResume={onResume}
        onCancel={onCancel}
        loading={loading}
        totalJobs={totalJobs}
        pagination={pagination}
        onChangePagination={(pagination) => setPagination(pagination)}
      />

      <AutoOrderDetailModal
        detailOpen={detailOpen}
        closeDetail={closeDetail}
        selectedJob={selectedJob}
        isEditable={isEditable}
        editForm={editForm}
        onChangeEditForm={onChangeEditForm}
        editMode={editMode}
        onChangeEditMode={onChangeEditMode}
        onUpdateJob={onUpdateJob}
      />

      <CreateAutoOrderModal
        open={createOpen}
        onClose={onCloseCreate}
        onCreateJob={onCreateJob}
        disabled={!canSubmit}
        formData={formData}
        onChangeData={onChangeData}
        selectedWallet={selectedWallet || undefined}
        onChangeWallet={(wallet) => setSelectedWallet(wallet)}
      />
    </Stack>
  )
}
