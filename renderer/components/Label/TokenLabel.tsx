import { Stack, Typography } from '@mui/material'
import { Token } from '../../types'
import Image from 'next/image'

interface TokenLabelProps {
  token: Token
}

export const TokenLabel: React.FC<TokenLabelProps> = ({ token }) => {
  return (
    <Stack
      direction={'row'}
      spacing={1}
      alignItems='center'
    >
      <Image
        src={token.logoURI ?? '/tokens/default-token.svg'}
        alt={token.symbol}
        width={24}
        height={24}
      />
      <Typography color='#fff'>{token.symbol}</Typography>
    </Stack>
  )
}
