import { SushiSwapV3ChainId } from 'sushi/config'
import { Amount } from 'sushi/currency'
import { SushiSwapV3Pool, computeSushiSwapV3PoolAddress } from 'sushi/pool'

import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { getBalance } from '@wagmi/core'
import { getV3FactoryContractConfig } from '../../contracts'

export const getConcentratedLiquidityPoolReserves = async ({
  pool,
  chainId,
  config,
}: {
  pool: SushiSwapV3Pool
  chainId: SushiSwapV3ChainId
  config: PublicWagmiConfig
}) => {
  const address = computeSushiSwapV3PoolAddress({
    factoryAddress: getV3FactoryContractConfig(chainId).address,
    tokenA: pool.token0,
    tokenB: pool.token1,
    fee: pool.fee,
  })

  const [balance1, balance2] = await Promise.all([
    getBalance(config, {
      address,
      chainId: pool.chainId,
      token: pool.token0.address,
    }),
    getBalance(config, {
      address,
      chainId: pool.chainId,
      token: pool.token1.address,
    }),
  ])

  return [
    Amount.fromRawAmount(pool.token0, balance1.value),
    Amount.fromRawAmount(pool.token1, balance2.value),
  ]
}
