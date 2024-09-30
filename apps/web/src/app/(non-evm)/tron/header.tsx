'use client'

import {
  Navigation,
  NavigationElement,
  NavigationElementType,
  NavigationListItem,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from '@sushiswap/ui'
import React, { FC } from 'react'

import { WalletConnector } from '~tron/_common/ui/WalletConnector/WalletConnector'

const nagivationElements: NavigationElement[] = [
  {
    title: 'Explore',
    items: [
      {
        title: 'Swap',
        href: '/swap',
        description: 'The easiest way to trade.',
      },
      {
        title: 'Explore',
        href: `/tron/explore/pools`,
        description: 'Explore top pools.',
      },
      {
        title: 'Pool',
        href: `/tron/pool`,
        description: 'Earn fees by providing liquidity.',
      },
    ],
    type: NavigationElementType.Dropdown,
    show: 'mobile',
  },
  {
    show: 'desktop',
    type: NavigationElementType.Custom,
    href: '/tron/swap',
    item: (
      <NavigationMenuItem className={NavigationElementType.Custom}>
        <NavigationMenuTrigger>Trade</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-[400px] gap-3 p-4">
            <NavigationListItem title={'Swap'} href={'/tron/swap'}>
              The easiest way to trade.
            </NavigationListItem>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    ),
  },
  {
    title: 'Explore',
    href: `/tron/explore/pools`,
    show: 'desktop',
    type: NavigationElementType.Single,
  },
  {
    title: 'Pool',
    href: `/tron/pool`,
    show: 'desktop',
    type: NavigationElementType.Single,
  },
]

export const Header: FC = () => {
  return (
    <Navigation
      leftElements={nagivationElements}
      rightElement={<WalletConnector variant="secondary" />}
    />
  )
}
