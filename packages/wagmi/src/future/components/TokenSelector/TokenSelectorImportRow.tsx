import {
  isTokenSecurityChainId,
  useTokenSecurity,
} from '@sushiswap/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Message,
} from '@sushiswap/ui'
import { Button } from '@sushiswap/ui/components/button'
import { Icon } from '@sushiswap/ui/components/currency/Icon'
import { List } from '@sushiswap/ui/components/list/List'
import { FC, useCallback, useState } from 'react'
import { shortenAddress } from 'sushi'
import { Chain } from 'sushi/chain'
import { Token } from 'sushi/currency'

import { TokenSecurityView } from '../TokenSecurityView'

interface TokenSelectorImportRow {
  currency: Token
  onImport(): void
}

export const TokenSelectorImportRow: FC<TokenSelectorImportRow> = ({
  currency,
  onImport,
}) => {
  const [open, setOpen] = useState(false)

  const {
    data: tokenSecurityResponse,
    isInitialLoading: tokenSecurityLoading,
  } = useTokenSecurity({
    currencies: [currency],
    enabled: open,
  })

  const onClick = useCallback(() => {
    onImport()

    setTimeout(() => {
      setOpen(false)
    }, 250)
  }, [onImport])

  const honeypot = Boolean(
    currency && tokenSecurityResponse?.[currency.address]?.is_honeypot,
  )

  return (
    <Dialog onOpenChange={(open) => !open && setOpen(false)}>
      <div className="relative py-0.5 h-[64px]">
        <div className="flex items-center w-full hover:bg-muted focus:bg-accent h-full rounded-lg px-3">
          <div className="flex flex-row items-center flex-grow gap-4">
            <div className="w-10 h-10">
              <Icon disableLink currency={currency} width={40} height={40} />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-gray-900 group-hover:text-gray-900 dark:text-slate-50 dark:group-hover:text-white">
                {currency.symbol}
              </span>
              <span className="text-sm text-gray-500 dark:text-slate-400 group-hover:dark:text-blue-100">
                {currency.name}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <DialogTrigger asChild>
              <Button size="xs" onClick={() => setOpen(true)}>
                Import
              </Button>
            </DialogTrigger>
          </div>
        </div>
      </div>
      {!isTokenSecurityChainId(currency.chainId) || !tokenSecurityLoading ? (
        <DialogContent className="!max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import token</DialogTitle>
            <DialogDescription>
              Anyone can create a token, including creating fake versions of
              existing tokens that claim to represent projects. If you purchase
              this token, you may not be able to sell it back.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <List>
              <List.Control>
                <List.KeyValue
                  title={
                    <span className="text-gray-900 dark:text-slate-50">
                      Name
                    </span>
                  }
                >
                  {currency.name}
                </List.KeyValue>
                <List.KeyValue
                  title={
                    <span className="text-gray-900 dark:text-slate-50">
                      Symbol
                    </span>
                  }
                >
                  {currency.symbol}
                </List.KeyValue>
                <List.KeyValue
                  title={
                    <span className="text-gray-900 dark:text-slate-50">
                      Address
                    </span>
                  }
                >
                  <a
                    target="_blank"
                    href={Chain.from(currency.chainId)?.getTokenUrl(
                      currency.address,
                    )}
                    className="text-blue"
                    rel="noreferrer"
                  >
                    {shortenAddress(currency.address)}
                  </a>
                </List.KeyValue>
              </List.Control>
            </List>
            {isTokenSecurityChainId(currency.chainId) ? (
              <TokenSecurityView
                tokenSecurityResponse={tokenSecurityResponse}
                token={currency}
              />
            ) : null}
          </div>
          <DialogFooter>
            <div className="flex flex-col gap-3 w-full">
              {!honeypot ? (
                <Button fullWidth size="xl" onClick={onClick}>
                  I understand
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <DialogTrigger asChild>
                    <Button fullWidth size="xl" onClick={() => setOpen(false)}>
                      Close
                    </Button>
                  </DialogTrigger>
                  <Message variant="destructive" size="sm">
                    Sushi does not support honetpot tokens. This token contract
                    cannot be imported!
                  </Message>
                </div>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
