import { getRebases as _getRebases } from '@sushiswap/graph-client/bentobox'
import { getV3BasePoolsByToken } from '@sushiswap/graph-client/data-api'
import { getFuroTokens as _getFuroTokens } from '@sushiswap/graph-client/furo'
import { fetchMultichain } from '@sushiswap/graph-client/multichain'
import { isSushiSwapV3ChainId } from 'sushi/config'
import { getChainIdAddressFromId } from 'sushi/format'
import { bentoBoxTokensSchema, furoTokensSchema } from './schema'

export const getV3PoolsByTokenPair = async (
  tokenId0: string,
  tokenId1: string,
) => {
  const { chainId: chainId0, address: address0 } =
    getChainIdAddressFromId(tokenId0)
  const { chainId: chainId1, address: address1 } =
    getChainIdAddressFromId(tokenId1)

  if (chainId0 !== chainId1) throw Error('Tokens must be on the same chain')

  if (!isSushiSwapV3ChainId(chainId0)) {
    throw Error('Invalid chain id')
  }

  const pools = await getV3BasePoolsByToken({
    chainId: chainId0,
    token0: address0,
    token1: address1,
  })

  return pools
}

export const getFuroTokens = async (
  query: (typeof furoTokensSchema)['_output'],
) => {
  try {
    const variables =
      query?.tokenSymbols && query.tokenSymbols?.length > 0
        ? {
            where: {
              or: query.tokenSymbols.map((symbol) => ({
                symbol_contains_nocase: symbol,
              })),
              liquidityShares_gt: '0',
            },
          }
        : {
            where: {
              liquidityShares_gt: '0',
            },
          }
    const { data: tokens } = await fetchMultichain({
      chainIds: query.chainIds,
      fetch: _getFuroTokens,
      variables,
    })

    return tokens
  } catch (error) {
    throw new Error(error as string)
  }
}

export const getBentoBoxTokens = async (
  query: (typeof bentoBoxTokensSchema)['_output'],
) => {
  try {
    const variables =
      query?.tokenSymbols && query.tokenSymbols?.length > 0
        ? {
            where: {
              or: query.tokenSymbols.map((symbol) => ({
                symbol_contains_nocase: symbol,
              })),
              base_gt: '0',
            },
          }
        : {
            where: {
              base_gt: '0',
            },
          }
    const { data: rebases } = await fetchMultichain({
      chainIds: query.chainIds,
      fetch: _getRebases,
      variables,
    })

    return rebases
  } catch (error) {
    throw new Error(error as string)
  }
}
