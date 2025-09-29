import { Box, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { MainContent } from '../components/MainContent'
import { Layout } from '../components/Layout'

export default function Home() {
  return (
    <Layout title='Assets Overview'>
      <MainContent />
    </Layout>
  )
}
