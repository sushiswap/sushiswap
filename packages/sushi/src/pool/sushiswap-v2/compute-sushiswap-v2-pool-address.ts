import { getCreate2Address } from '@ethersproject/address'
import { keccak256, pack } from '@ethersproject/solidity'
import invariant from 'tiny-invariant'
import { Address } from 'viem'
import {
  SUSHISWAP_V2_INIT_CODE_HASH,
  SushiSwapV2ChainId,
} from '../../config/index.js'
import { Token } from '../../currency/index.js'

/**
 * Computes a pair address
 * @param factoryAddress The Uniswap V2 factory address
 * @param tokenA The first token of the pair, irrespective of sort order
 * @param tokenB The second token of the pair, irrespective of sort order
 * @param initCodeHashManualOverride Override the init code hash used to compute the pool address if necessary
 * @returns The pair address
 */
export const computeSushiSwapV2PoolAddress = ({
  factoryAddress,
  tokenA,
  tokenB,
  initCodeHashManualOverride,
}: {
  factoryAddress: string
  tokenA: Token
  tokenB: Token
  initCodeHashManualOverride?: string
}): Address => {
  const [token0, token1] = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA] // does safety checks
  invariant(token0.chainId === token1.chainId, 'CHAIN_ID')
  return getCreate2Address(
    factoryAddress,
    keccak256(
      ['bytes'],
      [pack(['address', 'address'], [token0.address, token1.address])],
    ),
    initCodeHashManualOverride ??
      SUSHISWAP_V2_INIT_CODE_HASH[token0.chainId as SushiSwapV2ChainId],
  ) as Address
}
