import axios from 'axios'

export const getMarketPriceFromBinance = async (symbol: string) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://data-api.binance.vision/api/v3/avgPrice?symbol=${symbol}`
    })
    return response.data.price as string
  } catch (e) {
    console.error('Error getting market price from Binance', e)
    throw e
  }
}
