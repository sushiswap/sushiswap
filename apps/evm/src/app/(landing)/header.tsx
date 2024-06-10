'use client'

import {
  Button,
  Container,
  EXPLORE_NAVIGATION_LINKS,
  LinkInternal,
  NavigationContainer,
  NavigationListItem,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  OnramperButton,
  PARTNER_NAVIGATION_LINKS,
  TOOLS_NAVIGATION_LINKS,
  navigationMenuTriggerStyle,
} from '@sushiswap/ui'
import React, { FC } from 'react'

export const Header: FC = () => {
  return (
    <Container maxWidth="5xl" className="mx-auto">
      <NavigationContainer variant="transparent">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="block md:hidden">
              <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="w-[400px] gap-3 p-4">
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
            <NavigationMenuItem className="hidden md:block">
              <LinkInternal href="/swap">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Swap
                </NavigationMenuLink>
              </LinkInternal>
            </NavigationMenuItem>
            <NavigationMenuItem className="hidden md:block">
              <LinkInternal href="/pools">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Pools
                </NavigationMenuLink>
              </LinkInternal>
            </NavigationMenuItem>
            <NavigationMenuItem className="hidden md:block">
              <LinkInternal href="/bonds">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Bonds
                </NavigationMenuLink>
              </LinkInternal>
            </NavigationMenuItem>
            <NavigationMenuItem className="hidden md:block">
              <LinkInternal href="/stake">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Stake
                </NavigationMenuLink>
              </LinkInternal>
            </NavigationMenuItem>
            {/* <NavigationMenuItem className="hidden md:block">
              <LinkInternal href="/furo">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Pay
                </NavigationMenuLink>
              </LinkInternal>
            </NavigationMenuItem> */}
            <NavigationMenuItem className="hidden md:block">
              <NavigationMenuTrigger>More</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="w-[400px] gap-3 p-4">
                  {TOOLS_NAVIGATION_LINKS.map((component) => (
                    <NavigationListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                    >
                      {component.description}
                    </NavigationListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem className="hidden md:block">
              <NavigationMenuTrigger>Partners</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="w-[400px] gap-3 p-4">
                  {PARTNER_NAVIGATION_LINKS.map((component) => (
                    <NavigationListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                    >
                      {component.description}
                    </NavigationListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <LinkInternal href="/swap">
          <Button asChild>Enter App</Button>
        </LinkInternal>
      </NavigationContainer>
    </Container>
  )
}
