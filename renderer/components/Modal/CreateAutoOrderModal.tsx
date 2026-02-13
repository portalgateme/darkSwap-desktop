import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack
} from '@mui/material'
import { CreateAutoOrderFormData, OrderType } from '../../types'
import { CreateAutoOrderForm } from '../Form/CreateAutoOrderForm'
import { Wallet } from '../../types'
import { useState } from 'react'

interface CreateAutoOrderModalProps {
  open: boolean
  onClose: () => void
  onCreateJob: () => void
  disabled?: boolean
  formData: CreateAutoOrderFormData
  onChangeData: (data: Partial<CreateAutoOrderFormData>) => void
  selectedWallet?: Wallet
  onChangeWallet: (wallet: Wallet) => void
}

export const CreateAutoOrderModal = ({
  open,
  onClose,
  onCreateJob,
  disabled,
  formData,
  onChangeData,
  selectedWallet,
  onChangeWallet
}: CreateAutoOrderModalProps) => {
  const [errors, setErrors] = useState<{
    price?: string
    minPrice?: string
    maxPrice?: string
    amountOut?: string
    intervalSeconds?: string
    startAt?: string
    endAt?: string
  }>({})

  const handleClose = () => {
    onClose()
    setErrors({})
  }

  const validateField = (field: keyof CreateAutoOrderFormData, value: any) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'price':
        if (formData.orderType !== OrderType.MARKET) {
          if (!value || value.trim() === '') {
            newErrors.price = 'Price is required for limit orders'
          } else if (isNaN(Number(value)) || Number(value) <= 0) {
            newErrors.price = 'Price must be a positive number'
          } else {
            delete newErrors.price
          }
        } else {
          delete newErrors.price
        }
        break

      case 'minPrice':
        if (!value || value.trim() === '') {
          newErrors.minPrice = 'Min price is required'
        } else if (isNaN(Number(value)) || Number(value) <= 0) {
          newErrors.minPrice = 'Min price must be a positive number'
        } else {
          delete newErrors.minPrice
          // Cross-validation with maxPrice
          if (formData.maxPrice && Number(value) > Number(formData.maxPrice)) {
            newErrors.minPrice = 'Min price must be ≤ max price'
          }
        }
        break

      case 'maxPrice':
        if (!value || value.trim() === '') {
          newErrors.maxPrice = 'Max price is required'
        } else if (isNaN(Number(value)) || Number(value) <= 0) {
          newErrors.maxPrice = 'Max price must be a positive number'
        } else {
          delete newErrors.maxPrice
          // Cross-validation with minPrice
          if (formData.minPrice && Number(formData.minPrice) > Number(value)) {
            newErrors.maxPrice = 'Max price must be ≥ min price'
          } else if (errors.minPrice === 'Min price must be ≤ max price') {
            delete newErrors.minPrice
          }
        }
        break

      case 'amountOut':
        if (!value || value.trim() === '') {
          newErrors.amountOut = 'Amount is required'
        } else if (isNaN(Number(value)) || Number(value) <= 0) {
          newErrors.amountOut = 'Amount must be a positive number'
        } else {
          delete newErrors.amountOut
        }
        break

      case 'intervalSeconds':
        if (!value || value.trim() === '') {
          newErrors.intervalSeconds = 'Interval is required'
        } else if (isNaN(Number(value)) || Number(value) < 15) {
          newErrors.intervalSeconds = 'Interval must be at least 15 seconds'
        } else {
          delete newErrors.intervalSeconds
        }
        break

      case 'startAt':
        if (value) {
          const startDate = new Date(value).getTime()
          const now = Date.now()
          if (startDate < now - 60000) {
            // Allow 1 minute tolerance
            newErrors.startAt = 'Start date cannot be in the past'
          } else {
            delete newErrors.startAt
          }
        } else {
          delete newErrors.startAt
        }
        break

      case 'endAt':
        if (value) {
          const endDate = new Date(value).getTime()
          const startDate = formData.startAt
            ? new Date(formData.startAt).getTime()
            : Date.now()
          if (endDate <= startDate) {
            newErrors.endAt = 'End date must be after start date'
          } else {
            delete newErrors.endAt
          }
        } else {
          delete newErrors.endAt
        }
        break
    }

    setErrors(newErrors)
  }

  const btnCreateDisabled = disabled || Object.keys(errors).length > 0

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        style: { borderRadius: 16, background: '#1E2128' }
      }}
    >
      <DialogTitle sx={{ color: '#F3F4F6' }}>Create Auto Order Job</DialogTitle>
      <DialogContent>
        <Stack sx={{ mt: 1 }}>
          <CreateAutoOrderForm
            formData={formData}
            onChangeData={onChangeData}
            selectedWallet={selectedWallet}
            onChangeWallet={onChangeWallet}
            errors={errors}
            validateField={validateField}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant='contained'
          sx={{ background: '#68EB8E', color: '#0C1114' }}
          onClick={onCreateJob}
          disabled={btnCreateDisabled}
        >
          Create Job
        </Button>
        <Button
          variant='outlined'
          onClick={handleClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
