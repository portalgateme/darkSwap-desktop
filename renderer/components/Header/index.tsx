import { Box, Button, Stack, Typography } from '@mui/material'
import { Network, Wallet } from '../../types'
import { useEffect, useState } from 'react'
import NetworkSelection from '../Selection/NetworkSelection'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { shorterAddress } from '../../utils/format'
import { SelectAccountModal } from '../Modal/SelectAccountModal'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { useTokenBalance } from '../../hooks/useTokenBalance'
import { nativeToken } from '../../constants/tokenConfig'
import { ethers } from 'ethers'
import { ChainId } from '../../constants/networkConfig'

interface HeaderProps {
  title: string
}
export const Header = ({ title }: HeaderProps) => {
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [balance, setBalance] = useState<string>('0.00')
  const { getBalance } = useTokenBalance()

  const { selectedAccount, setSelectedAccount, setOpenAddModal } =
    useAccountContext()
  const { onChangeChain, currentChain, chainId } = useChainContext()

  const onOpenSelectAccount = () => {
    setOpenModal(true)
  }

  const onCloseModal = () => {
    setOpenModal(false)
  }

  const onChangeAccount = (account: Wallet) => {
    setSelectedAccount(account)
    onCloseModal()
  }

  useEffect(() => {
    if (!chainId || !selectedAccount) return
    getBalance(
      chainId,
      selectedAccount.address,
      nativeToken[chainId].address
    ).then((bal) => {
      const formattedBal = ethers.formatEther(bal)
      setBalance(
        new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 6,
          notation: 'compact'
        }).format(Number(formattedBal))
      )
    })
  }, [selectedAccount, currentChain])

  return (
    <Stack
      direction={'row'}
      justifyContent='space-between'
      alignItems='center'
    >
      <Typography
        color='#F3F4F6'
        variant='h3'
        fontWeight={700}
      >
        {title}
      </Typography>

      <Stack
        direction={'row'}
        spacing={2}
      >
        <NetworkSelection
          selectedNetwork={currentChain}
          onNetworkChange={onChangeChain}
        />

        <Stack
          direction={'row'}
          alignItems={'center'}
          spacing={1}
        >
          {/* Balance */}
          <Stack
            direction={'row'}
            alignItems={'center'}
            sx={{
              background: '#1E2128',
              borderRadius: '8px'
            }}
          >
            <Typography
              variant='body1'
              color='white'
              sx={{ padding: '8px 12px' }}
            >
              {balance} {nativeToken[chainId ?? ChainId.SEPOLIA].symbol}
            </Typography>
          </Stack>

          <Button
            variant='contained'
            startIcon={<AccountBalanceWalletIcon />}
            sx={{
              background: '#1E2128',
              borderRadius: '8px',
              textTransform: 'capitalize'
            }}
            onClick={onOpenSelectAccount}
          >
            <Typography variant='body1'>
              {selectedAccount
                ? shorterAddress(selectedAccount.address)
                : 'Connect Wallet'}
            </Typography>
          </Button>
        </Stack>
      </Stack>

      <SelectAccountModal
        open={openModal}
        onClose={onCloseModal}
        onSelectAccount={onChangeAccount}
      />
    </Stack>
  )
}
