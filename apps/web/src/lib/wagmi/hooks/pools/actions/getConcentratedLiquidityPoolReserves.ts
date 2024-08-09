import { V3Pool } from '@sushiswap/graph-client/data-api'
import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { getBalance } from '@wagmi/core'
import { Amount, Token } from 'sushi/currency'

export const getConcentratedLiquidityPoolReserves = async ({
  pool,
  config,
}: {
  pool: V3Pool
  config: PublicWagmiConfig
}) => {
  const [balance1, balance2] = await Promise.all([
    getBalance(config, {
      address: pool.address,
      chainId: pool.chainId,
      token: pool.token0.address,
    }),
    getBalance(config, {
      address: pool.address,
      chainId: pool.chainId,
      token: pool.token1.address,
    }),
  ])

  return [
    Amount.fromRawAmount(new Token(pool.token0), balance1.value),
    Amount.fromRawAmount(new Token(pool.token1), balance2.value),
  ]
}
