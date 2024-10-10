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
import { FC, useMemo, useState } from 'react'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { useFarms, useIsFarm } from '~aptos/pool/lib/farm/use-farms'
import { usePool } from '~aptos/pool/lib/use-pool'
import { useTokensFromPool } from '~aptos/pool/lib/use-tokens-from-pool'
import { useUnderlyingTokenBalanceFromPool } from '~aptos/pool/lib/use-underlying-token-balance-from-pool'
import { useTokenBalance } from '../lib/common/use-token-balances'
import { useTotalSupply } from '../lib/common/use-total-supply'
import {
  getPIdIndex,
  useUserHandle,
  useUserPool,
} from '../lib/common/use-user-handle'
import { AddSectionStake } from './AddSection/AddSectionStake'
import { AddSectionWidget } from './AddSection/AddSectionWidget'
import { RemoveSectionLegacy } from './RemoveSection/RemoveSectionLegacy'
import { RemoveSectionUnstake } from './RemoveSection/RemoveSectionUnstake'

export const ManageV2LiquidityCard: FC<{ address: string }> = ({ address }) => {
  const [tab, setTab] = useState<string>('add')

  const {
    contracts: { swap: swapContract },
  } = useNetwork()

  const { account } = useWallet()
  const { data: LPBalance } = useTokenBalance({
    account: account?.address as string,
    currency: `${swapContract}::swap::LPToken<${address}>`,
    enabled: true,
    refetchInterval: 2000,
  })

  const { data: pool } = usePool(address)

  const [reserve0, reserve1] = useMemo(() => {
    return [pool?.reserve0, pool?.reserve1]
  }, [pool])

  const { token0, token1 } = useTokensFromPool(pool)

  const { data: coinInfo } = useTotalSupply(address)

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
    token0,
    token1,
  })

  const { data: farms } = useFarms()
  const farmIndex = useIsFarm({ poolAddress: address, farms })
  const { data: userHandle } = useUserPool(account?.address)
  const { data: stakes } = useUserHandle({
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
            {useIsFarm({ poolAddress: address, farms }) ? (
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
            {useIsFarm({ poolAddress: address, farms }) ? (
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
            <AddSectionWidget pool={pool} />
          </CardContent>
        </TabsContent>
        <TabsContent value="remove">
          <CardContent>
            {pool && token0 && token1 ? (
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
            {pool && token0 && token1 ? (
              <AddSectionStake
                pool={pool}
                balance={balance}
                decimals={coinInfo?.data?.decimals}
                lpTokenName={coinInfo?.data?.name}
                token0={token0}
                token1={token1}
                price={lpPrice}
              />
            ) : null}
          </CardContent>
        </TabsContent>
        <TabsContent value="unstake">
          <CardContent>
            {pool ? (
              <RemoveSectionUnstake
                pool={pool}
                balance={farmBalance}
                decimals={coinInfo?.data?.decimals ?? 8}
                lpTokenName={coinInfo?.data?.name}
              />
            ) : null}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
