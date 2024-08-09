import type { SteerChainId } from '@sushiswap/steer-sdk'
import { SteerStrategy } from '@sushiswap/steer-sdk'
import type { VariablesOf } from 'gql.tada'
import { request, type RequestOptions } from 'src/lib/request'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import type { Address } from 'viem'
import { graphql } from '../../graphql'
import { SUSHI_REQUEST_HEADERS } from '../../request-headers'

export const VaultQuery = graphql(
  `
  query Vault($chainId: Int!, $vaultAddress: String!) {
    vault(chainId: $chainId, vaultAddress: $vaultAddress) {
      id
      address
      chainId
      poolAddress
      feeTier
      performanceFee
      token0 {
        id
        address
        name
        symbol
        decimals
      }
      token1 {
        id
        address
        name
        symbol
        decimals
      }
      adjustmentFrequency
      lastAdjustmentTimestamp
      strategy
      payloadHash
      lowerTick
      upperTick
      apr
      apr1d
      apr1w
      reserve0
      reserve0USD
      fees0
      fees0USD
      reserve1
      reserve1USD
      fees1
      fees1USD
      reserveUSD
      feesUSD
      feeApr1d
      feeAndIncentiveApr1d
      stakedApr1d
      stakedAndIncentiveApr1d
      incentiveApr
      wasIncentivized
      isIncentivized
      isEnabled
      wasEnabled
      isDeprecated
    }
  }
`,
)

export type GetVault = VariablesOf<typeof VaultQuery>

export async function getVault(variables: GetVault, options?: RequestOptions) {
  const url = `https://${SUSHI_DATA_API_HOST}`
  try {
    const result = await request(
      { url, document: VaultQuery, variables, requestHeaders: SUSHI_REQUEST_HEADERS },
      options,
    )
    if (result) {
      const vault = result.vault
      const strategy =
        SteerStrategy[vault.strategy as keyof typeof SteerStrategy]
      if (!strategy) throw new Error('No strategy found')
      return {
        ...vault,
        chainId: vault.chainId as SteerChainId,
        id: vault.id as `${string}:0x${string}`,
        address: vault.address as Address,
        reserve0: BigInt(vault.reserve0),
        reserve1: BigInt(vault.reserve1),
        fees0: BigInt(vault.fees0),
        fees1: BigInt(vault.fees1),
        token0: {
          ...vault.token0,
          id: `${vault.chainId}:${vault.token0.address}` as `${string}:0x${string}`,
          address: vault.token0.address as Address,
          chainId: vault.chainId as SteerChainId,
        },
        token1: {
          ...vault.token1,
          id: `${vault.chainId}:${vault.token1.address}` as `${string}:0x${string}`,
          address: vault.token1.address as Address,
          chainId: vault.chainId as SteerChainId,
        },
        strategy,
      }
    }

    throw new Error('No vault found')
  } catch {
    return null
  }
}

export type VaultV1 = NonNullable<Awaited<ReturnType<typeof getVault>>>
