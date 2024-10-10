'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import React, { useEffect } from 'react'
import { FC } from 'react'
import requiredNetworkAlert from '~aptos/_common/lib/common/required-network-alert'
import { PoolAddFormSelectTokensWidget } from '~aptos/pool/ui/pool/add/pool-add-form/pool-add-form-select-tokens-widget'
import { PoolAddFormWidget } from '~aptos/pool/ui/pool/add/pool-add-form/pool-add-form-widget'
import { usePoolPairs } from '~aptos/swap/lib/swap-get-route/use-pool-pairs'

export default function Page() {
  const { network, disconnect } = useWallet()

  usePoolPairs()

  useEffect(() => {
    requiredNetworkAlert(network, disconnect)
  }, [network, disconnect])

  return <_Add />
}

const _Add: FC = () => {
  return (
    <>
      <PoolAddFormSelectTokensWidget />
      <PoolAddFormWidget />
    </>
  )
}
