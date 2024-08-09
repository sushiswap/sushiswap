import { getDifficulties, getProducts } from '@sushiswap/graph-client/strapi'
import {
  Navigation,
  NavigationElement,
  NavigationElementType,
} from '@sushiswap/ui'
import React from 'react'
import { EXPLORE_NAVIGATION_LINKS } from '../_common/header-elements'
import { DOCS_URL } from './constants'

interface HeaderLink {
  name: string
  href: string
  isExternal?: boolean
}

export interface HeaderSection {
  title: string
  href?: string
  links?: HeaderLink[]
  isExternal?: boolean
  className?: string
}

const PRODUCTS_ORDER = ['furo', 'sushixswap', 'onsen', 'bentobox']

export async function Header() {
  const [products, difficulties] = await Promise.all([
    getProducts(),
    getDifficulties(),
  ])

  const sortedProducts = products.sort((a, b) =>
    PRODUCTS_ORDER.indexOf(a.slug as (typeof PRODUCTS_ORDER)[number]) >
    PRODUCTS_ORDER.indexOf(b.slug as (typeof PRODUCTS_ORDER)[number])
      ? 1
      : -1,
  )

  const navData: NavigationElement[] = [
    {
      title: 'Explore',
      items: EXPLORE_NAVIGATION_LINKS(),
      show: 'everywhere',
      type: NavigationElementType.Dropdown,
    },
    {
      title: 'Academy',
      href: '/academy',
      show: 'everywhere',
      type: NavigationElementType.Single,
    },
    {
      title: 'Blog',
      href: '/blog',
      show: 'everywhere',
      type: NavigationElementType.Single,
    },
    {
      title: 'Products',
      items: sortedProducts.map(({ longName, slug }) => ({
        title: longName,
        href: `/academy/products/${slug}`,
        description: '',
      })),
      show: 'desktop',
      type: NavigationElementType.Dropdown,
    },
    {
      title: 'Learn',
      items: difficulties?.map(({ shortDescription, slug }) => {
        const isTechnical = slug === 'technical'
        return {
          title: shortDescription,
          href: isTechnical ? DOCS_URL : `/academy/explore?difficulty=${slug}`,
          description: '',
        }
      }),
      show: 'desktop',
      type: NavigationElementType.Dropdown,
    },
  ]

  return <Navigation leftElements={navData} />
}
