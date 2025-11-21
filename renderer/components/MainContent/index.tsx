import React, { useEffect, useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import { WalletSetupModal } from '../Modal/WalletSetupModal'
import { UserAssetTable } from '../Table/UserAssetTable'
import NetworkSelection from '../Selection/NetworkSelection'
import { Network, Wallet } from '../../types'
import { shorterAddress } from '../../utils/format'
import { SelectAccountModal } from '../Modal/SelectAccountModal'
import { DepositModal } from '../Modal/DepositModal'
import { WithdrawModal } from '../Modal/WithdrawModal'
import { ethers } from 'ethers'
import { useAccountContext } from '../../contexts/AccountContext/hooks'
import { ca } from 'zod/v4/locales'
import { set } from 'zod'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { MyAssetsDto } from 'darkswap-client-core'
import { getTokenFromContract } from '../../utils/getToken'
import { useTokenBalance } from '../../hooks/useTokenBalance'
import { getMarketPriceFromBinance } from '../../services/orderService'
import { useGetAssets } from '../../hooks/useGetAssets'

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
  const { getBalance } = useTokenBalance()
  const { listData, fetchAssets } = useGetAssets()
  const { chainId } = useChainContext()

  const calculatePortfolioValue = async (assets: MyAssetsDto) => {
    let totalValue = 0
    const quoteSymbol = 'USDC' // Assuming USDC as the quote currency
    for (const asset of assets.assets) {
      const token = getTokenFromContract(asset.asset, assets.chainId)
      if (token) {
        const balance = ethers.formatUnits(asset.amount, token.decimals)
        const price = await getMarketPriceFromBinance(
          token.symbol + quoteSymbol
        )
        totalValue += parseFloat(balance) * parseFloat(price)
      }
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

  const onOpenSelectAccount = () => {
    setOpenModal(Modal.SelectAccount)
  }

  const onAddAccount = () => {
    onCloseModal()
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
          >
            Withdraw
          </Button>
        </Stack>
      </Stack>
      {/* Assets Table */}
      <Typography
        variant='h5'
        color='#F3F4F6'
        mt={4}
        mb={2}
      >
        Your Assets
      </Typography>
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
            sx={{
              background: '#68EB8E',
              color: '#000',
              textTransform: 'capitalize',
              borderRadius: '8px'
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
