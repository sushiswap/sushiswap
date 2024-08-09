import { getPortfolioWallet } from '../src/subgraphs/data-api'

const portfolio = await getPortfolioWallet({
  id: '0x3808699baf43ba988d1e9acd64237dea36c61593',
})

const isPortfolioWalletValid = portfolio.totalUSD > 0

console.log({ getPortfolioWallet: isPortfolioWalletValid })
