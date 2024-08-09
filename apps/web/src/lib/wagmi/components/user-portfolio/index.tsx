'use client'

import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetTrigger,
  useBreakpoint,
} from '@sushiswap/ui'
import { FC, ReactNode, useMemo, useState } from 'react'
import { ChainId, shortenAddress } from 'sushi'
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'
import { ConnectButton } from '../connect-button'
import { PortfolioDefaultView } from './PortfolioDefaultView'
import { PortfolioSettingsView } from './PortfolioSettingsView'

export enum PortfolioView {
  Default = 'Default',
  Settings = 'Settings',
}

const ResponsivePortfolioWrapper: FC<{
  content: ReactNode
  trigger: ReactNode
  isSm: boolean
}> = ({ content, trigger, isSm }) => {
  return isSm ? (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent hideClose className="!p-0">
        {content}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent hideClose className="!p-0 h-[calc(100%-16px)]">
        {content}
      </DialogContent>
    </Dialog>
  )
}

export const UserPortfolio = () => {
  const { isSm } = useBreakpoint('sm')
  const { address } = useAccount()
  const [view, setView] = useState(PortfolioView.Default)

  const { data: ensName, isLoading: isENSNameLoading } = useEnsName({
    chainId: ChainId.ETHEREUM,
    address,
  })

  const { data: avatar } = useEnsAvatar({
    name: ensName || undefined,
    chainId: ChainId.ETHEREUM,
  })

  const content = useMemo(() => {
    switch (view) {
      case PortfolioView.Settings:
        return <PortfolioSettingsView setView={setView} />
      default:
        return (
          <PortfolioDefaultView
            setView={setView}
            ensName={ensName}
            isENSNameLoading={isENSNameLoading}
          />
        )
    }
  }, [view, ensName, isENSNameLoading])

  if (!address) return <ConnectButton variant="secondary" />

  return (
    <ResponsivePortfolioWrapper
      trigger={
        <Button variant="secondary">
          {avatar ? (
            <img
              alt="ens-avatar"
              src={avatar}
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : null}
          <span>{shortenAddress(address)}</span>
        </Button>
      }
      content={content}
      isSm={isSm}
    />
  )
}
