import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  List,
} from '@sushiswap/ui'
import React, { FC, useCallback, useState } from 'react'
import { networkNameToNetwork } from '~aptos/_common/config/chains'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { Token } from '~aptos/_common/lib/types/token'
import { CurrencyIcon } from '../currency/currency-icon'

interface TokenSelectorImportRow {
  token: Token
  onImport(): void
}

export const TokenSelectorImportRow: FC<TokenSelectorImportRow> = ({
  token,
  onImport,
}) => {
  const [, setOpen] = useState<boolean>(false)

  const { network } = useNetwork()

  const onClick = useCallback(() => {
    onImport()

    setTimeout(() => {
      setOpen(false)
    }, 250)
  }, [onImport])

  return (
    <Dialog>
      <div className="relative py-0.5 h-[64px]">
        <div className="flex items-center w-full hover:bg-muted focus:bg-accent h-full rounded-lg px-3">
          <div className="flex flex-row items-center flex-grow gap-4">
            <div className="w-10 h-10">
              <CurrencyIcon currency={token} height={40} width={40} />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-gray-900 group-hover:text-gray-900 dark:text-slate-50 dark:group-hover:text-white">
                {token.symbol}
              </span>
              <span className="text-sm text-gray-500 dark:text-slate-400 group-hover:dark:text-blue-100">
                {token.name}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <DialogTrigger asChild>
              <Button size="xs">Import</Button>
            </DialogTrigger>
          </div>
        </div>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import token</DialogTitle>
          <DialogDescription>
            Trade at your own risk! This token doesn{"'"}t appear on the active
            token list(s). Anyone can create a token, including creating fake
            versions of existing tokens that claim to represent projects.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <List className="!pt-0">
            <List.Control>
              <div className="flex items-center gap-4 py-2 px-4">
                <CurrencyIcon currency={token} width={40} height={40} />
                <div className="flex flex-col gap-1">
                  <span className="truncate font-semibold text-gray-900 group-hover:text-gray-900 dark:text-slate-50 group-hover:dark:text-white">
                    {token.symbol}
                  </span>
                  <a
                    target="_blank"
                    href={`https://explorer.aptoslabs.com/account/${
                      token.address.split('::')[0]
                    }?network=${networkNameToNetwork(network)}`}
                    className="flex gap-1 text-sm text-blue font-medium"
                    rel="noreferrer"
                  >
                    {token.address.substring(0, 6)} ...{' '}
                    {token.address.split('::')[0].substring(66 - 4)}
                  </a>
                </div>
              </div>
            </List.Control>
          </List>
        </div>
        <DialogFooter>
          <div className="flex flex-col gap-3 w-full">
            <Button fullWidth size="xl" onClick={onClick}>
              I understand
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
