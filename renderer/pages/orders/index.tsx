import { Typography } from '@mui/material'
import { Layout } from '../../components/Layout'
import { OrderContent } from '../../components/OrderContent'
export default function Orders() {
  return (
    <Layout title='Place Order & Order List'>
      <OrderContent />
    </Layout>
  )
}
