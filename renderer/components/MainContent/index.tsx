import React, { useEffect, useState } from 'react'
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import { UserAssetTable } from '../Table/UserAssetTable'
import { Network, Wallet } from '../../types'
import { DepositModal } from '../Modal/DepositModal'
import { WithdrawModal } from '../Modal/WithdrawModal'
import { ethers } from 'ethers'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { MyAssetsDto } from 'darkswap-client-core'
import { getTokenFromContract } from '../../utils/getToken'
import {
  getMarketPriceFromBinance,
  getMarketPriceFromLlama
} from '../../services/orderService'
import { useGetAssets } from '../../hooks/useGetAssets'
import SyncIcon from '@mui/icons-material/Sync'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import InfoOutlineIcon from '@mui/icons-material/InfoOutline'

enum Modal {
  Deposit = 'DEPOSIT',
  Withdraw = 'WITHDRAW',
  SelectAccount = 'SELECT_ACCOUNT'
}

export const MainContent = () => {
  const [openModal, setOpenModal] = useState<Modal | null>(null)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [portfolio, setPortfolio] = useState<string>()

  const { selectedAccount, setOpenAddModal } = useAccountContext()
  const { chainId, currentChain } = useChainContext()
  const { listData, fetchAssets, syncAssets } = useGetAssets()

  const calculatePortfolioValue = async (assets: MyAssetsDto) => {
    if (!currentChain) return
    let totalValue = 0
    const defaultChainName = currentChain.isTestnet
      ? 'ethereum'
      : currentChain.name.toLowerCase()
    for (const asset of assets.assets) {
      const token = await getTokenFromContract(
        asset.asset,
        currentChain.chainId
      )
      if (!token) continue
      const balance = ethers.formatUnits(asset.amount, token.decimals)
      const price = await getMarketPriceFromLlama(defaultChainName, asset.asset)
      totalValue += parseFloat(balance) * price
    }
    setPortfolio(`$${totalValue.toFixed(2)}`)
  }

  useEffect(() => {
    if (listData) {
      calculatePortfolioValue(listData)
    } else {
      setPortfolio('$0.00')
    }
  }, [listData])

  const onCloseModal = () => {
    setError(null)
    setOpenModal(null)
  }

  const onOpenDeposit = () => {
    setOpenModal(Modal.Deposit)
  }

  const onConfirmDeposit = async (
    wallet: Wallet,
    asset: string,
    amount: string,
    chainId: number
  ) => {
    setError(null)
    setLoading(true)
    try {
      //@ts-ignore
      await window.accountAPI.deposit(chainId, wallet.address, asset, amount)
      await fetchAssets(chainId, wallet.address)
      onCloseModal()
    } catch (error) {
      console.error('Deposit failed:', error)
      setError(
        'Deposit failed: ' +
          (error instanceof Error ? error.message : String(error))
      )
    } finally {
      setLoading(false)
    }
  }

  const onSyncAssets = async () => {
    if (!selectedAccount || !chainId) return
    setLoading(true)
    setError(null)
    try {
      //@ts-ignore
      await syncAssets(selectedAccount.address, chainId)
    } catch (error) {
      console.error('Sync assets failed:', error)
      setError(
        'Sync assets failed: ' +
          (error instanceof Error ? error.message : String(error))
      )
    } finally {
      setLoading(false)
    }
  }

  const onOpenWithdraw = () => {
    setOpenModal(Modal.Withdraw)
  }

  const onConfirmWithdraw = async (
    wallet: Wallet,
    asset: string,
    amount: string,
    chainId: number
  ) => {
    if (!listData || !chainId) return
    setError(null)
    setLoading(true)
    try {
      // @ts-ignore
      await window.accountAPI.withdraw(chainId, wallet.address, asset, amount)
      await fetchAssets(chainId, wallet.address)
      onCloseModal()
    } catch (error) {
      console.error('Withdraw failed:', error)
      setError(
        'Withdraw failed: ' +
          (error instanceof Error ? error.message : String(error))
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      {/* Summary Metrics */}
      <Stack
        direction={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        padding={3}
        mt={2}
        sx={{
          background: '#1E2128',
          borderRadius: '20px'
        }}
      >
        {/* Balance */}
        <Stack>
          <Typography
            color='#F3F4F6'
            variant='body1'
          >
            Total Portfolio Value
          </Typography>
          <Typography
            color='#F3F4F6'
            variant='h4'
          >
            {portfolio}
          </Typography>
        </Stack>

        {/* Deposit Withdraw */}
        <Stack
          direction={'row'}
          spacing={2}
        >
          <Button
            variant='contained'
            sx={{
              background: '#68EB8E',
              color: '#000',
              textTransform: 'capitalize',
              borderRadius: '8px'
            }}
            endIcon={<FileDownloadOutlinedIcon />}
            onClick={onOpenDeposit}
            disabled={loading}
          >
            Deposit
          </Button>
          <Button
            variant='outlined'
            sx={{
              color: '#68EB8E',
              textTransform: 'capitalize',
              borderRadius: '8px',
              border: '1px solid #68EB8E'
            }}
            endIcon={<FileUploadOutlinedIcon />}
            onClick={onOpenWithdraw}
            disabled={loading}
          >
            Withdraw
          </Button>
        </Stack>
      </Stack>
      {/* Assets Table */}
      <Stack
        width={'100%'}
        direction={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        mt={4}
        mb={2}
      >
        <Typography
          variant='h5'
          color='#F3F4F6'
        >
          Your Assets
        </Typography>

        <Stack
          direction={'row'}
          spacing={0.5}
          alignItems={'center'}
        >
          <Tooltip title='Sync your Total Portfolio Value to the latest amount'>
            <InfoOutlineIcon sx={{ color: '#68EB8E', fontSize: '20px' }} />
          </Tooltip>
          <SyncIcon
            sx={{
              fill: '#F3F4F6',
              cursor: 'pointer',
              animation: loading ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(-360deg)' }
              },
              '&:hover': { rotate: '-180deg', transition: '0.3s' }
            }}
            onClick={onSyncAssets}
          />
        </Stack>
      </Stack>

      {/* Have not connected wallet */}
      {selectedAccount ? (
        <UserAssetTable listData={listData} />
      ) : (
        <Stack
          width={'100%'}
          minHeight={'400px'}
          alignItems={'center'}
          justifyContent={'center'}
          sx={{
            borderRadius: '20px',
            background: '#1E2128'
          }}
        >
          <Button
            variant='contained'
            size='large'
            sx={{
              background: '#68EB8E',
              color: '#000',
              textTransform: 'capitalize',
              borderRadius: '8px',
              fontSize: '20px',
              fontWeight: 600
            }}
            onClick={() => setOpenAddModal(true)}
          >
            Connect Wallet
          </Button>
        </Stack>
      )}

      <DepositModal
        open={openModal === Modal.Deposit}
        onClose={onCloseModal}
        onConfirm={onConfirmDeposit}
        loading={loading}
        error={error}
      />

      <WithdrawModal
        open={openModal === Modal.Withdraw}
        onClose={onCloseModal}
        onConfirm={onConfirmWithdraw}
        loading={loading}
        error={error}
      />
    </Box>
  )
}
