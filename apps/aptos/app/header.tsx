'use client'

import { Navigation } from '@sushiswap/ui'
import WalletSelector from 'components/WalletSelector'
import React, { FC } from 'react'

export const Header: FC = () => {
  return <Navigation showOnramper={false} rightElement={<WalletSelector />} />
}
