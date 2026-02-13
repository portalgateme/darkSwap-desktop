import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Select,
  MenuItem,
  TextField
} from '@mui/material'
import {
  AutoOrderJobDto,
  EditAutoOrderFormData,
  OrderDirection,
  OrderType
} from '../../types'
import { formatDate, statusLabel } from '../AutoOrderContent'
import { useAssetPairContext } from '../../contexts/AssetPairContext/hooks'

interface AutoOrderDetailModalProps {
  detailOpen: boolean
  closeDetail: () => void
  selectedJob: AutoOrderJobDto | null
  isEditable: boolean | null
  editForm: EditAutoOrderFormData
  onChangeEditForm: (data: Partial<EditAutoOrderFormData>) => void
  editMode: boolean
  onChangeEditMode: () => void
  onUpdateJob: () => void
}

export const AutoOrderDetailModal = ({
  detailOpen,
  closeDetail,
  selectedJob,
  isEditable,
  editForm,
  onChangeEditForm,
  editMode,
  onChangeEditMode,
  onUpdateJob
}: AutoOrderDetailModalProps) => {
  const { list, assetPair } = useAssetPairContext()

  return (
    <Dialog
      open={detailOpen}
      onClose={closeDetail}
      maxWidth='md'
      fullWidth
      PaperProps={{
        style: { borderRadius: 16, background: '#1E2128', color: '#F3F4F6' }
      }}
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
                  onChangeEditForm({ assetPairId: e.target.value })
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
                  onChangeEditForm({ orderDirection: Number(e.target.value) })
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
                  onChangeEditForm({ orderType: Number(e.target.value) })
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
              {editForm.orderType === OrderType.LIMIT && (
                <TextField
                  label='Price'
                  value={editForm.price}
                  onChange={(e) => onChangeEditForm({ price: e.target.value })}
                  disabled={!editMode}
                />
              )}
              <TextField
                label='Min Price'
                value={editForm.minPrice}
                onChange={(e) => onChangeEditForm({ minPrice: e.target.value })}
                disabled={!editMode}
              />
              <TextField
                label='Max Price'
                value={editForm.maxPrice}
                onChange={(e) => onChangeEditForm({ maxPrice: e.target.value })}
                disabled={!editMode}
              />
              <TextField
                label='Amount Out'
                value={editForm.amountOut}
                onChange={(e) =>
                  onChangeEditForm({ amountOut: e.target.value })
                }
                disabled={!editMode}
              />
              <TextField
                label='Fee Ratio'
                value={editForm.feeRatio}
                onChange={(e) => onChangeEditForm({ feeRatio: e.target.value })}
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
                onChange={(e) => onChangeEditForm({ startAt: e.target.value })}
                disabled={!editMode}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label='End Date'
                type='datetime-local'
                value={editForm.endAt}
                onChange={(e) => onChangeEditForm({ endAt: e.target.value })}
                disabled={!editMode}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label='Interval (seconds)'
                value={editForm.intervalSeconds}
                onChange={(e) =>
                  onChangeEditForm({ intervalSeconds: e.target.value })
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
            onClick={onChangeEditMode}
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
  )
}
