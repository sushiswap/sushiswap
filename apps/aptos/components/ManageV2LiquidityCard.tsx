'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sushiswap/ui'
import { useParams } from 'next/navigation'
import { FC, useMemo, useState } from 'react'
import { isFarm, useFarms } from '../utils/useFarms'
import { usePool } from '../utils/usePool'
import { Pool } from '../utils/usePools'
import { useTokenBalance } from '../utils/useTokenBalance'
import { useTokensFromPools } from '../utils/useTokensFromPool'
import { useTotalSupply } from '../utils/useTotalSupply'
import { useUnderlyingTokenBalanceFromPool } from '../utils/useUnderlyingTokenBalanceFromPool'
import { getPIdIndex, useUserHandle, useUserPool } from '../utils/useUserHandle'
import { AddSectionStake } from './AddSection/AddSectionStake'
import { AddSectionWidget } from './AddSection/AddSectionWidget'
import { RemoveSectionLegacy } from './RemoveSection/RemoveSectionLegacy'
import { RemoveSectionUnstake } from './RemoveSection/RemoveSectionUnstake'
import useStablePrice from 'utils/useStablePrice'

const CONTRACT_ADDRESS =
  process.env['SWAP_CONTRACT'] || process.env['NEXT_PUBLIC_SWAP_CONTRACT']

export const ManageV2LiquidityCard: FC = () => {
  const [tab, setTab] = useState<string>('add')
  const router = useParams()
  const tokenAddress = decodeURIComponent(router?.id)

  const { account } = useWallet()
  const { data: LPBalance } = useTokenBalance({
    account: account?.address as string,
    currency: `${CONTRACT_ADDRESS}::swap::LPToken<${tokenAddress}>`,
    enabled: true,
    refetchInterval: 2000,
  })

  const { data: pool } = usePool(tokenAddress)

  const [reserve0, reserve1] = useMemo(() => {
    return [pool?.data?.balance_x?.value, pool?.data?.balance_y?.value]
  }, [pool])

  const { token0, token1 } = useTokensFromPools(pool as Pool)

  const { data: coinInfo } = useTotalSupply(tokenAddress)

  const balance =
    coinInfo && LPBalance
      ? ((LPBalance / 10 ** coinInfo?.data?.decimals) as number)
      : 0
  const totalSupply = coinInfo?.data?.supply?.vec?.[0]?.integer?.vec?.[0]?.value

  const [underlying0, underlying1] = useUnderlyingTokenBalanceFromPool({
    balance: LPBalance,
    reserve0: Number(reserve0),
    reserve1: Number(reserve1),
    totalSupply: Number(totalSupply),
    decimals: coinInfo?.data?.decimals,
  })

  const { data: farms } = useFarms()
  const farmIndex = isFarm(tokenAddress, farms)
  const { data: userHandle } = useUserPool(account?.address)
  const { data: stakes } = useUserHandle({
    address: account?.address,
    userHandle,
  })

  const pIdIndex = useMemo(() => {
    return getPIdIndex(farmIndex, stakes)
  }, [stakes, farmIndex])

  const stakeAmount = useMemo(() => {
    if (stakes?.data.current_table_items.length && pIdIndex !== -1) {
      return Number(
        stakes?.data.current_table_items[pIdIndex]?.decoded_value?.amount,
      )
    } else {
      return 0
    }
  }, [stakes, pIdIndex])

  const farmBalance = coinInfo
    ? ((stakeAmount / 10 ** coinInfo?.data?.decimals) as number)
    : 0

  const [farmUnderlying0, farmUnderlying1] = useUnderlyingTokenBalanceFromPool({
    balance: stakeAmount,
    reserve0: Number(reserve0),
    reserve1: Number(reserve1),
    totalSupply: Number(totalSupply),
    decimals: coinInfo?.data?.decimals,
  })

  const token0Price = useStablePrice(token0)
  const token1Price = useStablePrice(token1)
  const token0RemovePoolPrice = token0Price
    ? (token0Price * Number(reserve0)) / 10 ** token0.decimals
    : 0
  const token1RemovePoolPrice = token1Price
    ? (token1Price * Number(reserve1)) / 10 ** token1.decimals
    : 0
  const lpPrice = coinInfo
    ? (Number(reserve0) + Number(reserve1)) / Number(totalSupply)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage</CardTitle>
        <CardDescription>Manage your position</CardDescription>
      </CardHeader>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <CardContent>
          <TabsList className="!flex">
            <TabsTrigger
              testdata-id="add-tab"
              value="add"
              className="flex flex-1"
            >
              Add
            </TabsTrigger>
            <TabsTrigger
              testdata-id="remove-tab"
              value="remove"
              className="flex flex-1"
            >
              Remove
            </TabsTrigger>
            {isFarm(tokenAddress, farms) ? (
              <TabsTrigger
                testdata-id="stake-tab"
                value="stake"
                className="flex flex-1"
              >
                Stake
              </TabsTrigger>
            ) : (
              <TabsTrigger
                testdata-id="stake-tab"
                disabled
                value="stake"
                className="flex flex-1"
              >
                Stake
              </TabsTrigger>
            )}
            {isFarm(tokenAddress, farms) ? (
              <TabsTrigger
                testdata-id="unstake-tab"
                value="unstake"
                className="flex flex-1"
              >
                Unstake
              </TabsTrigger>
            ) : (
              <TabsTrigger
                testdata-id="unstake-tab"
                disabled
                value="unstake"
                className="flex flex-1"
              >
                Unstake
              </TabsTrigger>
            )}
          </TabsList>
        </CardContent>
        <div className="px-6 pb-4">
          <Separator />
        </div>

        <TabsContent value="add">
          <CardContent>
            <AddSectionWidget />
          </CardContent>
        </TabsContent>
        <TabsContent value="remove">
          <CardContent>
            {pool ? (
              <RemoveSectionLegacy
                pool={pool}
                liquidityBalance={LPBalance}
                token0={token0}
                token1={token1}
                balance={balance}
                underlying0={underlying0}
                underlying1={underlying1}
                totalSupply={totalSupply}
                isFarm={farmIndex !== -1}
              />
            ) : null}
          </CardContent>
        </TabsContent>
        <TabsContent value="stake">
          <CardContent>
            <AddSectionStake
              balance={balance}
              decimals={coinInfo?.data?.decimals}
              lpTokenName={coinInfo?.data?.name}
              lpPrice={lpPrice}
            />
          </CardContent>
        </TabsContent>
        <TabsContent value="unstake">
          <CardContent>
            <RemoveSectionUnstake
              balance={farmBalance}
              decimals={coinInfo?.data?.decimals ?? 8}
              lpTokenName={coinInfo?.data?.name}
            />
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
