import { createClient } from '@sushiswap/database'
import { publicWagmiConfig } from '@sushiswap/wagmi-config'
import { createConfig } from '@wagmi/core'
import { getToken as getTokenFromContract } from '@wagmi/core/actions'
import { ChainId } from 'sushi/chain'
import { Address } from 'viem'
// import * as defaultTokenList from '@sushiswap/default-token-list' assert { type: 'json' }

const config = createConfig(publicWagmiConfig)

export async function getToken(chainId: number, address: string) {
  // TODO: example to include default list token
  // const tokenFromList = defaultTokenList.tokens.find((token) => token.chainId === chainId && token.address === address)
  // if (tokenFromList) {
  //   return {
  //     id: `${chainId}:${tokenFromList.address}`,
  //     address: tokenFromList.address,
  //     name: tokenFromList.name,
  //     symbol: tokenFromList.symbol,
  //     decimals: tokenFromList.decimals,
  //     isCommon: false,
  //   }
  // }

  const client = await createClient()
  try {
    const token = await client.token.findFirstOrThrow({
      select: {
        id: true,
        address: true,
        name: true,
        symbol: true,
        decimals: true,
        isCommon: true,
        isFeeOnTransfer: true,
        status: true,
      },
      where: {
        chainId,
        address,
      },
    })
    await client.$disconnect()
    return token
  } catch {
    await client.$disconnect()
    const tokenFromContract = await getTokenFromContract(config, {
      chainId: chainId as ChainId,
      address: address as Address,
    }).catch(() => {
      return undefined
    })
    if (tokenFromContract) {
      return {
        id: `${chainId}:${tokenFromContract.address}`,
        address: tokenFromContract.address,
        name: tokenFromContract.name,
        symbol: tokenFromContract.symbol,
        decimals: tokenFromContract.decimals,
        isCommon: false,
      }
    } else {
      throw new Error('Token not found')
    }
  }
}

export async function getTokenIdsByChainId(chainId: number) {
  const client = await createClient()
  const ids = await client.token.findMany({
    select: {
      id: true,
    },
    where: {
      AND: {
        chainId,
        status: 'APPROVED',
      },
    },
  })
  await client.$disconnect()
  return ids ? ids : []
}

export async function getTokenAddressesByChainId(chainId: number) {
  const client = await createClient()
  const addresses = await client.token.findMany({
    select: {
      address: true,
    },
    where: {
      AND: {
        chainId,
        status: 'APPROVED',
      },
    },
  })
  await client.$disconnect()
  return addresses ? addresses : []
}

export async function getTokensByChainId(chainId: number) {
  const client = await createClient()
  const tokens = await client.token.findMany({
    select: {
      id: true,
      address: true,
      name: true,
      symbol: true,
      decimals: true,
      isCommon: true,
      isFeeOnTransfer: true,
    },
    where: {
      AND: {
        chainId,
        status: 'APPROVED',
      },
    },
  })
  await client.$disconnect()
  return tokens ? tokens : []
}

export async function getTokens() {
  const client = await createClient()
  const tokens = await client.token.findMany({
    select: {
      id: true,
      address: true,
      chainId: true,
      name: true,
      symbol: true,
      decimals: true,
      isCommon: true,
      isFeeOnTransfer: true,
    },
    where: {
      AND: {
        status: 'APPROVED',
      },
    },
  })
  await client.$disconnect()
  return tokens ? tokens : []
}

export async function getPopularTokens(chainId: number) {
  const client = await createClient()

  const approvedTokens = await client.token.findMany({
    select: {
      id: true,
      address: true,
      name: true,
      symbol: true,
      decimals: true,
      isCommon: true,
      isFeeOnTransfer: true,
      pools0: {
        select: {
          liquidityUSD: true,
        },
        where: {
          isWhitelisted: true,
          liquidityUSD: {
            gt: 50,
          },
        },
      },
      pools1: {
        select: {
          liquidityUSD: true,
        },
        where: {
          isWhitelisted: true,
          liquidityUSD: {
            gt: 50,
          },
        },
      },
    },
    where: {
      chainId,
      status: 'APPROVED',
    },
  })

  const filteredTokens = approvedTokens
    .map((token) => {
      const liquidity =
        token.pools0.reduce((a, b) => a + Number(b.liquidityUSD) / 2, 0) +
        token.pools1.reduce((a, b) => a + Number(b.liquidityUSD) / 2, 0)
      return {
        id: token.id,
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        isCommon: token.isCommon,
        isFeeOnTransfer: token.isFeeOnTransfer,
        liquidityUSD: Number(liquidity.toFixed(0)),
      }
    })
    .sort((a, b) => b.liquidityUSD - a.liquidityUSD)
    .slice(0, 10)

  await client.$disconnect()
  return filteredTokens ? filteredTokens : []
}

export async function getCommonTokens(chainId: number) {
  const client = await createClient()
  const tokens = await client.token.findMany({
    select: {
      id: true,
      address: true,
      name: true,
      symbol: true,
      decimals: true,
      isCommon: true,
      isFeeOnTransfer: true,
    },
    where: {
      chainId,
      isCommon: true,
      status: 'APPROVED',
    },
  })

  await client.$disconnect()
  return tokens ? tokens : []
}

export async function getTokensByAddress(address: string) {
  const client = await createClient()
  const tokens = await client.token.findMany({
    select: {
      id: true,
      chainId: true,
      address: true,
      name: true,
      symbol: true,
      decimals: true,
      isCommon: true,
      isFeeOnTransfer: true,
      status: true,
    },
    where: {
      address,
    },
  })

  await client.$disconnect()
  return tokens ? tokens : []
}
