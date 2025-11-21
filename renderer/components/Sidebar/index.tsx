import { Box, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import HistoryIcon from '@mui/icons-material/History'
import CheckIcon from '@mui/icons-material/Check'
import { useState } from 'react'

const darkpoolResourceLinks = {
  testnetGuide:
    'https://testnet.thesingularity.network/?utm_source=testnet&utm_medium=link&utm_campaign=darkpool_testnetguide',

  faucet: 'https://thesingularity.network/redirect/faucet',
  pointDashboard:
    'https://app.thesingularity.network/season2?utm_source=testnetpoints&utm_medium=link&utm_campaign=points_dashboard_testnet'
}

export const Sidebar = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const handleExternalLink = (url: string, itemKey: string) => {
    navigator.clipboard.writeText(url)
    setCopiedItem(itemKey)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  return (
    <Stack
      justifyContent={'space-between'}
      sx={{
        width: 300,
        bgcolor: '#0C1114',
        height: 'calc(100vh - 32px)', // Adjusted height to fit within viewport minus padding
        padding: 2
      }}
    >
      <Stack
        sx={{
          height: '100%'
        }}
      >
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
          onClick={() =>
            handleExternalLink(
              darkpoolResourceLinks.testnetGuide,
              'testnetGuide'
            )
          }
          sx={{ cursor: 'pointer' }}
        >
          <Typography
            variant='body2'
            color='#BDC1CA'
          >
            Testnet Guide
          </Typography>

          {copiedItem === 'testnetGuide' ? (
            <CheckIcon sx={{ color: '#68EB8E', fontSize: 16 }} />
          ) : (
            <Image
              src={'/images/link.png'}
              alt='Link Icon'
              width={16}
              height={16}
            />
          )}
        </Stack>
        <Stack
          width={'100%'}
          direction='row'
          alignItems='center'
          spacing={1}
          justifyContent={'space-between'}
          onClick={() =>
            handleExternalLink(darkpoolResourceLinks.faucet, 'faucet')
          }
          sx={{
            cursor: 'pointer'
          }}
        >
          <Typography
            variant='body2'
            color='#BDC1CA'
          >
            Get Sepolia ETH
          </Typography>

          {copiedItem === 'faucet' ? (
            <CheckIcon sx={{ color: '#68EB8E', fontSize: 16 }} />
          ) : (
            <Image
              src={'/images/link.png'}
              alt='Link Icon'
              width={16}
              height={16}
            />
          )}
        </Stack>
        <Stack
          width={'100%'}
          direction='row'
          alignItems='center'
          spacing={1}
          justifyContent={'space-between'}
          onClick={() =>
            handleExternalLink(
              darkpoolResourceLinks.pointDashboard,
              'pointDashboard'
            )
          }
          sx={{
            cursor: 'pointer'
          }}
        >
          <Typography
            variant='body2'
            color='#BDC1CA'
          >
            Points Dashboard
          </Typography>
          {copiedItem === 'pointDashboard' ? (
            <CheckIcon sx={{ color: '#68EB8E', fontSize: 16 }} />
          ) : (
            <Image
              src={'/images/link.png'}
              alt='Link Icon'
              width={16}
              height={16}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}
