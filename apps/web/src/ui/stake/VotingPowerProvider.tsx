'use client'

import { useQuery } from '@tanstack/react-query'
import { FC, ReactNode, createContext, useContext, useMemo } from 'react'
import {
  erc20Abi_balanceOf,
  erc20Abi_totalSupply,
  masterChefV1Abi_userInfo,
} from 'sushi/abi'
import { ChainId } from 'sushi/chain'
import { MASTERCHEF_ADDRESS } from 'sushi/config'
import {
  Amount,
  SUSHI_ADDRESS,
  Token,
  Type,
  XSUSHI,
  XSUSHI_ADDRESS,
  tryParseAmount,
} from 'sushi/currency'
import { Fraction } from 'sushi/math'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { useAmountBalances } from '~evm/_common/ui/balance-provider/use-balances'

const SnapshotStrategies = [
  {
    name: 'erc20-balance-of',
    params: {
      address: '0x62d11bc0652e9D9B66ac0a4c419950eEb9cFadA6',
      symbol: 'SUSHIPOWAH',
      decimals: '18',
    },
  },
  {
    name: 'erc20-balance-of',
    params: {
      address: '0x6811079E3c63ED96Eb005384d7E7ec8810E3D521',
      decimals: 18,
    },
    network: '137',
  },
]

const SUSHI_ETH_SLP_ADDRESS = '0x795065dCc9f64b5614C407a6EFDC400DA6221FB0'

export const SUSHI_ETH_SLP = new Token({
  chainId: ChainId.ETHEREUM,
  address: SUSHI_ETH_SLP_ADDRESS,
  decimals: 18,
  symbol: 'SUSHI-ETH SLP',
  name: 'SUSHI-ETH LP Token',
})

interface VotingPowerContext {
  votingPower: number | undefined
  balances:
    | {
        xsushi: Amount<Type>
        slp: Amount<Type>
        xsushiPolygon: Amount<Type>
      }
    | undefined
  weights:
    | {
        xsushi: Fraction
        slp: Fraction
        xsushiPolygon: Fraction
      }
    | undefined
  isConnected: boolean
  isLoading: boolean
  isError: boolean
}

const Context = createContext<VotingPowerContext | undefined>(undefined)

export const VotingPowerProvider: FC<{
  children: ReactNode
}> = ({ children }) => {
  const { address, isConnected } = useAccount()

  const {
    data: votingPowerData,
    isLoading: isVotingPowerLoading,
    isError: isVotingPowerError,
  } = useQuery({
    queryKey: ['snapshot-scores', address],
    queryFn: async () => {
      if (!address) throw new Error()

      // The import is unnecessarily big and gets bundled with the whole app
      const snapshot = (await import('@snapshot-labs/snapshot.js')).default

      const resp = await snapshot.utils.getVp(
        address,
        '1',
        SnapshotStrategies,
        'latest',
        'sushigov.eth',
        true,
      )

      return resp
    },
    enabled: Boolean(address),
    staleTime: 300000,
  })

  const {
    data: ethereumBalances,
    isLoading: isBalancesLoading,
    isError: isBalancesError,
  } = useAmountBalances(
    ChainId.ETHEREUM,
    useMemo(() => [XSUSHI[ChainId.ETHEREUM], SUSHI_ETH_SLP], []),
  )

  const {
    data: contractData,
    isLoading: isContractDataLoading,
    isError: isContractDataError,
  } = useReadContracts({
    contracts: useMemo(
      () =>
        [
          // sushi.balanceOf(SUSHI-ETH LP)
          {
            chainId: ChainId.ETHEREUM,
            abi: erc20Abi_balanceOf,
            address: SUSHI_ADDRESS[ChainId.ETHEREUM],
            functionName: 'balanceOf',
            args: [SUSHI_ETH_SLP_ADDRESS],
          },
          // sushi.balanceOf(XSUSHI)
          {
            chainId: ChainId.ETHEREUM,
            abi: erc20Abi_balanceOf,
            address: SUSHI_ADDRESS[ChainId.ETHEREUM],
            functionName: 'balanceOf',
            args: [XSUSHI_ADDRESS[ChainId.ETHEREUM]],
          },
          // SUSHI-ETH-LP.totalSupply()
          {
            chainId: ChainId.ETHEREUM,
            abi: erc20Abi_totalSupply,
            address: SUSHI_ETH_SLP_ADDRESS,
            functionName: 'totalSupply',
          },
          // xsushi.totalSupply()
          {
            chainId: ChainId.ETHEREUM,
            abi: erc20Abi_totalSupply,
            address: XSUSHI_ADDRESS[ChainId.ETHEREUM],
            functionName: 'totalSupply',
          },
        ] as const,
      [],
    ),
    query: {
      staleTime: 300000,
    },
  })

  // Users' staked Sushi-ETH SLP
  const {
    data: userStakedSLP,
    isInitialLoading: isUserStakedSLPLoading,
    isError: isUserStakedSLPError,
  } = useReadContract({
    chainId: ChainId.ETHEREUM,
    abi: masterChefV1Abi_userInfo,
    address: MASTERCHEF_ADDRESS[ChainId.ETHEREUM],
    functionName: 'userInfo',
    args: [12n, address!],
    query: {
      enabled: Boolean(address),
      staleTime: 30000,
    },
  })

  const weights = useMemo(() => {
    if (
      !contractData?.length ||
      contractData.some((data) => data.status !== 'success')
    )
      return undefined

    const [
      sushiBalanceSLP,
      sushiBalanceXSUSHI,
      slpTotalSupply,
      xsushiTotalSupply,
    ] = contractData

    const xsushiWeight = new Fraction(
      sushiBalanceXSUSHI.result as bigint,
      xsushiTotalSupply.result as bigint,
    )

    const slpWeight = new Fraction(
      (sushiBalanceSLP.result as bigint) * 2n,
      slpTotalSupply.result as bigint,
    )

    return {
      xsushi: xsushiWeight,
      slp: slpWeight,
      xsushiPolygon: new Fraction(1, 1),
    }
  }, [contractData])

  const balances = useMemo(() => {
    const xSushiBalance = ethereumBalances?.get(XSUSHI[ChainId.ETHEREUM].id)
    const slpBalance = ethereumBalances?.get(SUSHI_ETH_SLP.id)

    if (
      !xSushiBalance ||
      !slpBalance ||
      !votingPowerData?.vp_by_strategy?.[1] ||
      !userStakedSLP
    ) {
      return undefined
    }

    return {
      xsushi: xSushiBalance,
      slp: slpBalance.add(
        Amount.fromRawAmount(SUSHI_ETH_SLP, userStakedSLP[0]),
      ) as Amount<Type>,
      xsushiPolygon: tryParseAmount(
        votingPowerData.vp_by_strategy[1].toString(),
        new Token({
          chainId: ChainId.POLYGON,
          address: XSUSHI_ADDRESS[ChainId.POLYGON],
          decimals: 18,
          symbol: 'XSUSHI (Polygon)',
          name: 'SushiBar',
        }),
      ) as Amount<Type>,
    }
  }, [ethereumBalances, userStakedSLP, votingPowerData?.vp_by_strategy])

  return (
    <Context.Provider
      value={useMemo(
        () => ({
          votingPower: votingPowerData?.vp,
          balances,
          weights,
          isConnected,
          isLoading:
            isVotingPowerLoading ||
            isBalancesLoading ||
            isContractDataLoading ||
            isUserStakedSLPLoading,
          isError:
            isVotingPowerError ||
            isBalancesError ||
            isContractDataError ||
            isUserStakedSLPError,
        }),
        [
          votingPowerData?.vp,
          balances,
          weights,
          isConnected,
          isVotingPowerLoading,
          isBalancesLoading,
          isContractDataLoading,
          isUserStakedSLPLoading,
          isUserStakedSLPError,
          isVotingPowerError,
          isBalancesError,
          isContractDataError,
        ],
      )}
    >
      {children}
    </Context.Provider>
  )
}

export const useVotingPower = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('Hook can only be used inside VotingPower Context')
  }

  return context
}
