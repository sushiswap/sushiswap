'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Popover,
  PopoverContent,
  PopoverPrimitive,
} from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import { usePathname, useRouter } from 'next/navigation'
import React, { ReactNode, useCallback, useState } from 'react'
import {
  NEW_CHAIN_IDS,
  NonStandardChainId,
  isNonStandardChainId,
} from 'src/config'
import { getNetworkName, replaceNetworkSlug } from 'src/lib/network'
import { ChainId, isChainId, isNetworkNameKey } from 'sushi/chain'

export type NetworkSelectorOnSelectCallback<
  T extends number | string = ChainId | NonStandardChainId,
> = (chainId: T, close: () => void) => void

export interface NetworkSelectorProps<
  T extends number | string = ChainId | NonStandardChainId,
> {
  networks: readonly T[]
  selected: T
  onSelect: NetworkSelectorOnSelectCallback<T>
  children: ReactNode
}

const NetworkSelector = <T extends number | string>({
  onSelect,
  networks = [],
  children,
}: Omit<NetworkSelectorProps<T>, 'variant'>) => {
  const [open, setOpen] = useState(false)
  const { push } = useRouter()
  const pathname = usePathname()

  const _onSelect = useCallback(
    (_network: string, close: () => void) => {
      const network = (isChainId(+_network) ? +_network : _network) as T
      const pathSegments = pathname.split('/')
      if (
        isNetworkNameKey(pathSegments[1]) ||
        isChainId(+pathSegments[1]) ||
        isNonStandardChainId(pathSegments[1])
      ) {
        push(
          replaceNetworkSlug(network as ChainId | NonStandardChainId, pathname),
          { scroll: false },
        )
      } else if (isNonStandardChainId(network.toString())) {
        push(`/${network}/swap`, { scroll: false })
      }

      onSelect(network, close)
    },
    [push, pathname, onSelect],
  )

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverContent className="!w-60 !p-0 !overflow-x-hidden !overflow-y-scroll scroll">
        <Command>
          <CommandInput
            testdata-id="network-selector-input"
            placeholder="Search network"
          />
          <CommandEmpty>No network found.</CommandEmpty>
          <CommandGroup>
            {networks.map((network) => {
              const name = getNetworkName(
                network as ChainId | NonStandardChainId,
              )

              return (
                <CommandItem
                  className="cursor-pointer"
                  testdata-id={`network-selector-${network}`}
                  value={`${name}__${network}`}
                  key={network}
                  onSelect={(value) => {
                    const network = value.split('__')[1]
                    _onSelect(network, () => setOpen(false))
                  }}
                >
                  <div className="flex items-center gap-2">
                    <NetworkIcon chainId={network} width={22} height={22} />
                    {name}
                    {NEW_CHAIN_IDS.includes(
                      network as (typeof NEW_CHAIN_IDS)[number],
                    ) ? (
                      <div className="text-[10px] italic rounded-full px-[6px] bg-gradient-to-r from-blue to-pink text-white font-bold">
                        NEW
                      </div>
                    ) : null}
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { NetworkSelector }
