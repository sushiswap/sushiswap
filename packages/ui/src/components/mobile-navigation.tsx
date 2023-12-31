'use client'

import { Bars3Icon } from '@heroicons/react/20/solid'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import React, { FC } from 'react'
import {
  EXPLORE_NAVIGATION_LINKS,
  PARTNER_NAVIGATION_LINKS,
  ScrollArea,
  TOOLS_NAVIGATION_LINKS,
  classNames,
  navigationContainerVariants,
} from '../index'
import { Button } from './button'
import { SushiIcon } from './icons'
import { Sheet, SheetContent, SheetTrigger } from './sheet'

interface MobileNavigationProps {
  rightElement?: React.ReactNode
}

export const MobileNavigation: FC<MobileNavigationProps> = ({
  rightElement,
}) => {
  const [open, setOpen] = React.useState(false)

  return (
    <div
      className={navigationContainerVariants({
        variant: 'default',
        className: 'block md:hidden',
      })}
    >
      <div className="flex items-center justify-between flex-grow gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="-ml-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Bars3Icon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileLink
              href="/"
              className="flex items-center"
              onOpenChange={setOpen}
            >
              <SushiIcon className="mr-2 h-4 w-4" width={24} height={24} />
              <span className="font-bold">Sushi</span>
            </MobileLink>
            <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {EXPLORE_NAVIGATION_LINKS.slice(0, -2).map(
                  (item) =>
                    item.href && (
                      <MobileLink
                        key={item.href}
                        href={item.href}
                        onOpenChange={setOpen}
                      >
                        {item.title}
                      </MobileLink>
                    ),
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col space-y-3 pt-6">
                  <h4 className="font-medium">More</h4>
                  {TOOLS_NAVIGATION_LINKS.map(
                    (item) =>
                      item.href && (
                        <MobileLink
                          key={item.href}
                          href={item.href}
                          onOpenChange={setOpen}
                          className="text-muted-foreground"
                        >
                          {item.title}
                        </MobileLink>
                      ),
                  )}
                </div>
                <div className="flex flex-col space-y-3 pt-6">
                  <h4 className="font-medium">Partners</h4>
                  {PARTNER_NAVIGATION_LINKS.map(
                    (item) =>
                      item.href && (
                        <MobileLink
                          key={item.href}
                          href={item.href}
                          onOpenChange={setOpen}
                          className="text-muted-foreground"
                        >
                          {item.title}
                        </MobileLink>
                      ),
                  )}
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          {rightElement ? rightElement : null}
        </div>
      </div>
    </div>
  )
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter()
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString())
        onOpenChange?.(false)
      }}
      className={classNames(className)}
      {...props}
    >
      {children}
    </Link>
  )
}
