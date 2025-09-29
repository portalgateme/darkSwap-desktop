import { Box, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import HistoryIcon from '@mui/icons-material/History'

export const Sidebar = () => {
  return (
    <Stack
      justifyContent={'space-between'}
      sx={{
        width: 300,
        bgcolor: '#0C1114',
        height: '100%',
        padding: 2
      }}
    >
      <Stack>
        <Box
          width={200}
          height={40}
          position='relative'
          marginBottom={4}
        >
          <Image
            src={'/images/logo.png'}
            alt='Logo'
            fill
          />
        </Box>

        <Stack spacing={1}>
          <Link href='/'>
            <Stack
              direction={'row'}
              spacing={2}
              alignItems='center'
              sx={{
                padding: 1,
                borderRadius: 1,
                ':hover': {
                  backgroundColor: '#262A33'
                }
              }}
            >
              <Image
                src={'/images/overview.png'}
                alt='Home Icon'
                width={16}
                height={16}
              />
              <Typography
                variant='body1'
                color='#fff'
              >
                Account Overview
              </Typography>
            </Stack>
          </Link>

          <Link href='/orders'>
            <Stack
              direction={'row'}
              spacing={2}
              alignItems='center'
              sx={{
                padding: 1,
                borderRadius: 1,
                ':hover': {
                  backgroundColor: '#262A33'
                }
              }}
            >
              <Image
                src={'/images/order-list.png'}
                alt='Home Icon'
                width={16}
                height={16}
              />

              <Typography
                variant='body1'
                color='#fff'
              >
                Place Order & Order List
              </Typography>
            </Stack>
          </Link>

          <Link href='/history'>
            <Stack
              direction={'row'}
              spacing={2}
              alignItems='center'
              sx={{
                padding: 1,
                borderRadius: 1,
                ':hover': {
                  backgroundColor: '#262A33'
                }
              }}
            >
              <HistoryIcon sx={{ color: '#fff', fontSize: 16 }} />

              <Typography
                variant='body1'
                color='#fff'
              >
                Order History
              </Typography>
            </Stack>
          </Link>
        </Stack>
      </Stack>

      {/* Resources */}
      <Stack
        width={'100%'}
        spacing={1}
      >
        <Typography
          variant='body2'
          color='#68EB8E'
          marginBottom={1}
        >
          Resources
        </Typography>

        <Stack
          width={'100%'}
          direction='row'
          alignItems='center'
          spacing={1}
          justifyContent={'space-between'}
        >
          <Typography
            variant='body2'
            color='#BDC1CA'
          >
            Testnet Guide
          </Typography>

          <Image
            src={'/images/link.png'}
            alt='Link Icon'
            width={16}
            height={16}
          />
        </Stack>
        <Stack
          width={'100%'}
          direction='row'
          alignItems='center'
          spacing={1}
          justifyContent={'space-between'}
        >
          <Typography
            variant='body2'
            color='#BDC1CA'
          >
            Get Sepolia ETH
          </Typography>

          <Image
            src={'/images/link.png'}
            alt='Link Icon'
            width={16}
            height={16}
          />
        </Stack>
        <Stack
          width={'100%'}
          direction='row'
          alignItems='center'
          spacing={1}
          justifyContent={'space-between'}
        >
          <Typography
            variant='body2'
            color='#BDC1CA'
          >
            Points Dashboard
          </Typography>

          <Image
            src={'/images/link.png'}
            alt='Link Icon'
            width={16}
            height={16}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
