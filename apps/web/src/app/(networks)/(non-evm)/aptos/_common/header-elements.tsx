import {
  NavigationElement,
  NavigationElementType,
  NavigationListItem,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
  OnramperButton,
} from '@sushiswap/ui'
import React from 'react'
import { EXPLORE_NAVIGATION_LINKS } from 'src/app/_common/header-elements'

export const headerElements: NavigationElement[] = [
  {
    title: 'Explore',
    items: EXPLORE_NAVIGATION_LINKS(),
    show: 'mobile',
    type: NavigationElementType.Dropdown,
  },
  {
    show: 'desktop',
    type: NavigationElementType.Custom,
    href: '/swap',
    item: (
      <NavigationMenuItem className={NavigationElementType.Custom}>
        <NavigationMenuTrigger>Trade</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-[400px] gap-3 p-4">
            <NavigationListItem title={'Swap'} href={'/aptos/swap'}>
              The easiest way to trade.
            </NavigationListItem>
            <OnramperButton>
              <NavigationListItem title={'Buy Crypto'}>
                Onramp with fiat.
              </NavigationListItem>
            </OnramperButton>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    ),
  },
  {
    title: 'Explore',
    href: `/aptos/explore/pools`,
    show: 'desktop',
    type: NavigationElementType.Single,
  },

  {
    title: 'Pool',
    href: `/aptos/pool`,
    show: 'desktop',
    type: NavigationElementType.Single,
  },
  {
    title: 'Stake',
    href: '/stake',
    show: 'desktop',
    type: NavigationElementType.Single,
  },
  // {
  //   title: 'More',
  //   items: MORE_NAVIGATION_LINKS,
  //   show: 'desktop',
  //   type: NavigationElementType.Dropdown,
  // },
]
