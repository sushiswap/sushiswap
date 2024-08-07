import { getSteerVault } from '@sushiswap/client'
import { SteerVault } from '@sushiswap/client'
import {
  SteerChainId,
  getTokenRatios,
  getVaultPositions,
} from '@sushiswap/steer-sdk'
import { Container } from '@sushiswap/ui'
import formatDistanceStrict from 'date-fns/formatDistanceStrict'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { unstable_cache } from 'next/cache'
import {
  SteerStrategyComponents,
  SteerStrategyGeneric,
} from 'src/ui/pool/Steer/SteerStrategies'
import { publicClientConfig } from 'sushi/config'
import { Token } from 'sushi/currency'
import { formatNumber, unsanitize } from 'sushi/format'
import { tickToPrice } from 'sushi/pool/sushiswap-v3'
import { PublicClient, createPublicClient } from 'viem'

function getPriceExtremes(
  vault: SteerVault,
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

function getAdjustment(vault: SteerVault): SteerStrategyGeneric['adjustment'] {
  const next = formatDistanceToNow(
    (vault.lastAdjustmentTimestamp + vault.adjustmentFrequency) * 1000,
    {
      addSuffix: true,
    },
  )
  const frequency = formatDistanceStrict(vault.adjustmentFrequency * 1000, 0)

  return { next, frequency }
}

async function getGenerics(vault: SteerVault): Promise<SteerStrategyGeneric> {
  const client = createPublicClient(
    publicClientConfig[vault.pool.chainId as SteerChainId],
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
}: { params: { vaultId: string } }) {
  const vaultId = unsanitize(params.vaultId)

  const vault = await unstable_cache(
    () => getSteerVault(vaultId),
    ['steer-vault', vaultId],
    { revalidate: 60 * 15 },
  )()
  const generics = await unstable_cache(
    async () => await getGenerics(vault),
    ['steer-vault-generics', vaultId],
    {
      revalidate: 60 * 5,
    },
  )()

  const Component = SteerStrategyComponents[vault.strategy]

  return (
    <Container maxWidth="5xl" className="px-2 sm:px-4">
      <Component vault={vault} generic={generics} />
    </Container>
  )
}
