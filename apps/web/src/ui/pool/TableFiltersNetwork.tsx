'use client'

import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { Chip, Popover, PopoverContent, PopoverTrigger } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@sushiswap/ui'
import { CheckIcon } from '@sushiswap/ui/icons/CheckIcon'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import { usePathname, useRouter } from 'next/navigation'
import React, { FC, useCallback, useState } from 'react'
import { SUPPORTED_CHAIN_IDS } from 'src/config'
import { Chain, ChainId } from 'sushi/chain'

export const TableFiltersNetwork: FC<{ chainId: ChainId }> = ({ chainId }) => {
  const [open, setOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  const onClick = useCallback(
    (chainId: string) => {
      const pathSegments = pathname.split('/')
      pathSegments[1] = chainId
      router.push(pathSegments.join('/'))
    },
    [pathname, router],
  )

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          icon={PlusCircleIcon}
          variant="outline"
          role="combobox"
          size="sm"
          aria-expanded={open}
          className="!border-dashed"
        >
          <span>Networks</span>
          <Chip variant="secondary">{Chain.from(chainId)?.name}</Chip>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="!p-0 !overflow-x-hidden !overflow-y-scroll scroll"
      >
        <Command className="flex items-center gap-1">
          <CommandInput
            testdata-id="network-selector-input"
            placeholder="Search network"
          />
          <CommandEmpty>No network found.</CommandEmpty>
          <CommandGroup>
            {SUPPORTED_CHAIN_IDS.map((_chainId) => (
              <CommandItem
                key={_chainId}
                value={_chainId.toString()}
                onSelect={onClick}
                className="py-2 pl-8 pr-2"
              >
                {chainId === _chainId ? (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <CheckIcon
                      strokeWidth={3}
                      width={16}
                      height={16}
                      className="text-blue"
                    />
                  </span>
                ) : null}
                <NetworkIcon
                  chainId={_chainId}
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {Chain.from(_chainId)?.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
