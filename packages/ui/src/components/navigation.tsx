import { type VariantProps, cva } from 'class-variance-authority'
import Link from 'next/link'
import * as React from 'react'

import classNames from 'classnames'
import { SushiIcon } from './icons/SushiIcon'
import { navigationMenuTriggerStyle } from './navigation-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './navigation-menu'
import { OnramperButton } from './onramper'

const EXPLORE_NAVIGATION_LINKS: {
  title: string
  href: string
  description: string
}[] = [
  {
    title: 'Swap',
    href: '/swap',
    description: 'The easiest way to trade.',
  },
  {
    title: 'Pools',
    href: '/pools',
    description: 'Earn fees by providing liquidity.',
  },
  {
    title: 'Bonds',
    href: '/bonds',
    description: 'Earn interest by locking up your assets.',
  },
  {
    title: 'Stake',
    href: '/stake',
    description: 'Earn protocol fees by staking SUSHI.',
  },
  // {
  //   title: 'Pay',
  //   href: '/furo',
  //   description: 'Automate salaries and vesting schedules.',
  // },
  {
    title: 'Analytics',
    href: '/analytics',
    description: 'Find the best opportunities',
  },
  {
    title: 'Blog',
    href: '/blog',
    description:
      'Stay up to date with the latest product developments at Sushi.',
  },
  {
    title: 'Academy',
    href: '/academy',
    description: 'Everything you need to get up to speed with DeFi.',
  },
  {
    title: 'Partner with Sushi',
    href: '/partner',
    description: 'Incentivize your token with Sushi rewards.',
  },
  {
    title: 'List enquiry',
    href: '/tokenlist-request',
    description: 'Get your token on our default token list.',
  },
]

const TOOLS_NAVIGATION_LINKS: {
  title: string
  href: string
  description: string
}[] = [
  {
    title: 'Analytics',
    href: '/analytics',
    description: 'Find the best opportunities',
  },
  {
    title: 'Blog',
    href: '/blog',
    description:
      'Stay up to date with the latest product developments at Sushi.',
  },
  {
    title: 'Academy',
    href: '/academy',
    description: 'Everything you need to get up to speed with DeFi.',
  },
  {
    title: 'Forum & Proposals',
    href: 'https://forum.sushi.com',
    description: 'View and discuss proposals for SushiSwap.',
  },
  {
    title: 'Participate',
    href: 'https://snapshot.org/#/sushigov.eth',
    description:
      'As a Sushi holder, you can vote on proposals to shape the future of SushiSwap.',
  },
]

const PARTNER_NAVIGATION_LINKS: {
  title: string
  href: string
  description: string
}[] = [
  {
    title: 'Partner with Sushi',
    href: '/partner',
    description: 'Incentivize your token with Sushi rewards.',
  },
  {
    title: 'List enquiry',
    href: '/tokenlist-request',
    description: 'Get your token on our default token list.',
  },
]

const navigationContainerVariants = cva(
  'px-4 sticky flex items-center flex-grow gap-4 top-0 z-50 min-h-[56px] max-h-[56px] h-[56px]',
  {
    variants: {
      variant: {
        default:
          'bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800',
        transparent: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface NavContainerProps
  extends VariantProps<typeof navigationContainerVariants> {
  children: React.ReactNode
}

const NavigationContainer: React.FC<NavContainerProps> = ({
  children,
  variant,
}) => {
  return (
    <div className={navigationContainerVariants({ variant })}>
      <SushiIcon width={24} height={24} />
      <div className="flex items-center justify-between flex-grow gap-4">
        {children}
      </div>
    </div>
  )
}

const navigationMenuItems = [
  {
    title: 'Swap',
    href: '/swap',
  },
  {
    title: 'Pools',
    href: '/pool',
  },
  {
    title: 'Bonds',
    href: '/bonds',
  },
  {
    title: 'Stake',
    href: '/stake',
  },
  // {
  //   title: 'Pay',
  //   href: '/furo',
  // },
  {
    title: 'More',
    items: TOOLS_NAVIGATION_LINKS,
  },
  {
    title: 'Partners',
    items: PARTNER_NAVIGATION_LINKS,
  },
] as const

interface NavProps extends VariantProps<typeof navigationContainerVariants> {
  leftElements?: (typeof navigationMenuItems)[number]['title'][]
  rightElement?: React.ReactNode
  legacyBehavior?: boolean
  showOnramper?: boolean
}

const Navigation: React.FC<NavProps> = ({
  leftElements: _leftElements = navigationMenuItems.map((entry) => entry.title),
  rightElement,
  variant,
  legacyBehavior = false,
  showOnramper = true,
}) => {
  const leftElements = React.useMemo(() => {
    const SimpleItem = (entry: (typeof navigationMenuItems)[number]) => {
      if (!('href' in entry)) {
        throw new Error('Invalid entry')
      }

      return (
        <NavigationMenuItem key={entry.title} className="hidden md:block">
          {legacyBehavior ? (
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <a href={entry.href}>{entry.title}</a>
            </NavigationMenuLink>
          ) : (
            <NavigationMenuLink
              href={entry.href}
              className={navigationMenuTriggerStyle()}
            >
              {entry.title}
            </NavigationMenuLink>
          )}
        </NavigationMenuItem>
      )
    }

    const DropdownItem = (entry: (typeof navigationMenuItems)[number]) => {
      if (!('items' in entry)) {
        throw new Error('Invalid entry')
      }

      return (
        <NavigationMenuItem key={entry.title} className="hidden md:block">
          <NavigationMenuTrigger>{entry.title}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-[400px] gap-3 p-4">
              {entry.items.map((component) => (
                <NavigationListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                  legacyBehavior={legacyBehavior}
                >
                  {component.description}
                </NavigationListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      )
    }

    return _leftElements.map((el) => {
      const entry = navigationMenuItems.find((entry) => entry.title === el)!

      if ('href' in entry) {
        return SimpleItem(entry)
      } else {
        return DropdownItem(entry)
      }
    })
  }, [_leftElements, legacyBehavior])

  return (
    <NavigationContainer variant={variant}>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem className="block md:hidden">
            <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="min-w-[240px] gap-3 p-4">
                {EXPLORE_NAVIGATION_LINKS.map((component) => (
                  <NavigationListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </NavigationListItem>
                ))}
                <OnramperButton>
                  <NavigationListItem title="Buy Crypto">
                    Need to buy some more crypto?
                  </NavigationListItem>
                </OnramperButton>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          {leftElements}
          {showOnramper ? (
            <NavigationMenuItem className="hidden md:block">
              <OnramperButton>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Buy Crypto
                </NavigationMenuLink>
              </OnramperButton>
            </NavigationMenuItem>
          ) : null}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-2">
        {rightElement ? rightElement : null}
      </div>
    </NavigationContainer>
  )
}

interface NavigationListItemProps extends React.ComponentPropsWithoutRef<'a'> {
  legacyBehavior?: boolean
}

const NavigationListItem = React.forwardRef<
  React.ElementRef<'a'>,
  NavigationListItemProps
>(
  (
    { className, title, children, legacyBehavior = false, href, ...props },
    ref,
  ) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          {legacyBehavior || !href ? (
            <a
              ref={ref}
              className={classNames(
                'cursor-pointer block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                className,
              )}
              href={href}
              {...props}
            >
              <div className="text-sm font-medium leading-none">{title}</div>
              <p className="text-sm leading-snug line-clamp-2 text-muted-foreground">
                {children}
              </p>
            </a>
          ) : (
            <Link
              href={href}
              className={classNames(
                'cursor-pointer block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                className,
              )}
            >
              <div className="text-sm font-medium leading-none">{title}</div>
              <p className="text-sm leading-snug line-clamp-2 text-muted-foreground">
                {children}
              </p>
            </Link>
          )}
        </NavigationMenuLink>
      </li>
    )
  },
)

NavigationListItem.displayName = 'NavListItem'

export {
  EXPLORE_NAVIGATION_LINKS,
  Navigation,
  NavigationContainer,
  NavigationListItem,
  PARTNER_NAVIGATION_LINKS,
  TOOLS_NAVIGATION_LINKS,
}
