import {
  V3Pool,
  VaultV1,
  getV3Pool,
  getVault,
  isSmartPoolChainId,
} from '@sushiswap/graph-client/data-api'
import { getTokenRatios, getVaultPositions } from '@sushiswap/steer-sdk'
import { Container } from '@sushiswap/ui'
import formatDistanceStrict from 'date-fns/formatDistanceStrict'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { unstable_cache } from 'next/cache'
import { SteerStrategyGeneric } from 'src/ui/pool/Steer/SteerStrategies'
import { SteerBaseStrategy } from 'src/ui/pool/Steer/SteerStrategies/SteerBaseStrategy'
import type { ChainId } from 'sushi'
import { isSushiSwapV3ChainId, publicClientConfig } from 'sushi/config'
import { Token } from 'sushi/currency'
import { formatNumber } from 'sushi/format'
import { tickToPrice } from 'sushi/pool/sushiswap-v3'
import { PublicClient, createPublicClient, isAddress } from 'viem'
import notFound from '../../../../../not-found'

function getPriceExtremes(
  vault: VaultV1,
): SteerStrategyGeneric['priceExtremes'] {
  const token0 = new Token(vault.token0)
  const token1 = new Token(vault.token1)

  let lowerPrice = tickToPrice(token0, token1, vault.lowerTick).toSignificant(7)
  let upperPrice = tickToPrice(token0, token1, vault.upperTick).toSignificant(7)

  lowerPrice =
    !lowerPrice.includes('.') && lowerPrice.length > 9
      ? formatNumber(lowerPrice)
      : lowerPrice
  upperPrice =
    !upperPrice.includes('.') && upperPrice.length > 9
      ? formatNumber(upperPrice)
      : upperPrice
  return { min: lowerPrice, max: upperPrice }
}

function getAdjustment(vault: VaultV1): SteerStrategyGeneric['adjustment'] {
  const next = formatDistanceToNow(
    (vault.lastAdjustmentTimestamp + vault.adjustmentFrequency) * 1000,
    {
      addSuffix: true,
    },
  )
  const frequency = formatDistanceStrict(vault.adjustmentFrequency * 1000, 0)

  return { next, frequency }
}

async function getGenerics(vault: VaultV1): Promise<SteerStrategyGeneric> {
  const client = createPublicClient(
    publicClientConfig[vault.chainId],
  ) as PublicClient

  const prices = await fetch(
    `https://api.sushi.com/price/v1/${vault.chainId}`,
  ).then((data) => data.json())

  const priceExtremes = getPriceExtremes(vault)
  const tokenRatios = await getTokenRatios({
    vault,
    prices,
  })
  const adjustment = getAdjustment(vault)
  const positions =
    (await getVaultPositions({
      client,
      vaultId: vault.id,
    })) || []

  return { priceExtremes, tokenRatios, adjustment, positions }
}

export default async function SteerVaultPage({
  params,
}: { params: { chainId: string; vault: string; address: string } }) {
  const chainId = Number(params.chainId) as ChainId
  const vaultAddress = params.vault
  const poolAddress = params.address

  if (
    !isSushiSwapV3ChainId(chainId) ||
    !isSmartPoolChainId(chainId) ||
    !isAddress(poolAddress, { strict: false }) ||
    !isAddress(vaultAddress, { strict: false })
  ) {
    return notFound()
  }

  const pool = (await unstable_cache(
    async () =>
      await getV3Pool({
        chainId,
        address: poolAddress,
      }),
    ['pool', `${params.chainId}:${params.address}`],
    { revalidate: 60 * 15 },
  )()) as NonNullable<V3Pool>

  const vault = (await unstable_cache(
    async () =>
      await getVault({
        chainId,
        vaultAddress,
      }),
    ['vault', `${params.chainId}:${params.vault}`],
    { revalidate: 60 * 15 },
  )()) as NonNullable<VaultV1>

  const generics = await unstable_cache(
    async () => await getGenerics(vault),
    ['steer-vault-generics', `${params.chainId}:${params.vault}`],
    {
      revalidate: 60 * 15,
    },
  )()

  const Component = SteerBaseStrategy

  return (
    <Container maxWidth="5xl" className="px-4">
      {vault.isDeprecated && (
        <div className="text-center text-red dark:text-red-600 w-full pb-8">
          <div className=" font-medium">This vault is deprecated.</div>
          <div className="text-sm">
            {"It will not accrue any fees and won't be readjusted."}
          </div>
        </div>
      )}
      <Component pool={pool} vault={vault} generic={generics} />
    </Container>
  )
}
