import type { VariablesOf } from 'gql.tada'
import { SteerStrategy } from '@sushiswap/steer-sdk'
import { request, type RequestOptions } from 'src/lib/request'
import { graphql } from '../../graphql'
import type { SteerChainId } from '@sushiswap/steer-sdk'
import type { Address } from 'viem'

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

export async function getVault(
  variables: GetVault,
  options?: RequestOptions,
) {
  const url = `https://data-api-production-acb1.up.railway.app/graphql/`

  const result = await request(
    { url, document: VaultQuery, variables },
    options,
  )
  if (result) {
    const vault = result.vault
    const strategy = SteerStrategy[vault.strategy as keyof typeof SteerStrategy]
    if (!strategy) throw new Error('No strategy found')
      return {
        ...vault,
        chainId: vault.chainId as SteerChainId,
        id: `${vault.chainId}:${vault.id}` as `${string}:0x${string}`,
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

  throw new Error('No smart pool found')
}

export type VaultV1 = Awaited<ReturnType<typeof getVault>>