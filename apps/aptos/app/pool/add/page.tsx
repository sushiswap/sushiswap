'use client'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Container } from '@sushiswap/ui'
import React, { FC, useEffect } from 'react'
import requiredNetworkAlert from 'utils/requiredNetworkAlert'
import { Add } from '../../../components/Pool/PoolPage'

export default function AddPage() {
  const { network, disconnect } = useWallet()

  useEffect(() => {
    requiredNetworkAlert(network, disconnect)
  }, [network, disconnect])

  return (
    <>
      <Container
        maxWidth={'5xl'}
        className="flex justify-center lg:mx-auto px-4 h-full"
      >
        <div className="pb-4 mt-10 mb-4 lg:mb-40 xl:mt-20">
          <div className="grid grid-cols-1 sm:w-[340px] md:w-[572px] gap-10">
            <_Add />
          </div>
        </div>
      </Container>
    </>
  )
}

const _Add: FC = () => {
  return (
    <>
      <div className="flex flex-col order-3 gap-[64px] pb-40 sm:order-2">
        <Add />
      </div>
    </>
  )
}
