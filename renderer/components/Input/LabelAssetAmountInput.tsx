import { InputBase, Stack, Typography } from '@mui/material'
import { Token } from '../../types'
import { TokenLabel } from '../Label/TokenLabel'

interface LabelAssetAmountInputProps {
  label: string
  token: Token
}
export const LabelAssetAmountInput: React.FC<LabelAssetAmountInputProps> = ({
  label,
  token
}) => {
  return (
    <Stack width={'100%'}>
      <Typography color='#fff'>{label}</Typography>
      <Stack
        direction={'row'}
        spacing={1}
        alignItems='center'
        justifyContent={'space-between'}
        sx={{
          border: '1px solid #323743',
          padding: '4px 12px',
          borderRadius: '8px'
        }}
      >
        <InputBase
          placeholder='0.00'
          sx={{ width: '100%', color: '#fff' }}
        />
        <TokenLabel token={token} />
      </Stack>
    </Stack>
  )
}
