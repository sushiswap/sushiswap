'use client'

import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { useMutationObserver } from '@sushiswap/hooks'
import {
  Chip,
  CommandList,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Label,
  Popover,
  PopoverContent,
  PopoverPrimitive,
  PopoverTrigger,
  Separator,
} from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
import { Command, CommandGroup, CommandItem } from '@sushiswap/ui'
import { CheckIcon } from '@sushiswap/ui/icons/CheckIcon'
import React, { FC, useCallback, useState, useTransition } from 'react'

import { SushiSwapProtocol } from 'sushi'
import { PROTOCOL_MAP } from '../../lib/constants'
import { usePoolFilters, useSetPoolFilters } from './PoolsFiltersProvider'

export const POOL_TYPES = [
  SushiSwapProtocol.SUSHISWAP_V3,
  SushiSwapProtocol.SUSHISWAP_V2,
]

const POOL_DESCRIPTIONS = {
  [SushiSwapProtocol.SUSHISWAP_V3]:
    'A pool type known as concentrated liquidity, which maximizes capital efficiency by providing the liquidity in a pre-defined range around the current price of the pair. If a user’s position moves out of range, it will not be capturing fees and will need to adjust their range or wait for the price to return to it.',
  [SushiSwapProtocol.SUSHISWAP_V2]:
    'The traditional pool type with a fixed fee of .30% that utilizes a constant product formula to ensure a 50/50 composition of each asset in the pool.',
}

const isAllThenNone = (protocols: SushiSwapProtocol[]) =>
  protocols.length === POOL_TYPES.length ? [] : protocols

export const TableFiltersPoolType: FC = () => {
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const { protocols } = usePoolFilters()
  const setFilters = useSetPoolFilters()
  const [peekedProtocol, setPeekedProtocol] = React.useState<SushiSwapProtocol>(
    POOL_TYPES[0],
  )
  const [localValue, setValues] = useState<SushiSwapProtocol[]>(
    isAllThenNone(protocols),
  )

  const values = pending ? localValue : isAllThenNone(protocols)

  const protocolHandler = useCallback(
    (item: SushiSwapProtocol) => {
      let _newValues: SushiSwapProtocol[]
      if (values?.includes(item)) {
        _newValues = values.filter((el) => el !== item)
      } else {
        _newValues = [...(values ?? []), item]
      }
      setValues(_newValues)

      startTransition(() => {
        setFilters((prev) => {
          if (prev.protocols?.includes(item)) {
            const protocols = prev.protocols.filter((el) => el !== item)
            return { ...prev, protocols }
          } else {
            return { ...prev, protocols: [...(prev.protocols ?? []), item] }
          }
        })
      })
    },
    [setFilters, values],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          icon={PlusCircleIcon}
          aria-label="Select a protocol"
          variant="outline"
          role="combobox"
          size="sm"
          aria-expanded={open}
          className="!border-dashed"
        >
          <span>Type</span>
          {values?.length > 0 && (
            <>
              <Separator orientation="vertical" className="m-1 !h-4" />
              <Chip variant="secondary" className="lg:hidden">
                {values.length}
              </Chip>
              <div className="hidden lg:flex gap-1">
                {values.length > 2 ? (
                  <Chip variant="secondary">{values.length} selected</Chip>
                ) : (
                  POOL_TYPES.filter((option) => values.includes(option)).map(
                    (option) => (
                      <Chip variant="secondary" key={option}>
                        {PROTOCOL_MAP[option]}
                      </Chip>
                    ),
                  )
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="!w-[unset] !p-0">
        <HoverCard>
          <PopoverPrimitive.Portal>
            <HoverCardContent
              side="left"
              align="start"
              forceMount
              className="hidden md:block w-[240px]"
            >
              <div className="flex flex-col gap-2">
                <Label>{PROTOCOL_MAP[peekedProtocol]}</Label>
                <div className="text-sm text-muted-foreground">
                  {POOL_DESCRIPTIONS[peekedProtocol]}
                </div>
              </div>
            </HoverCardContent>
          </PopoverPrimitive.Portal>
          <Command className="flex items-center gap-1">
            <CommandList>
              <HoverCardTrigger />
              <CommandGroup>
                {POOL_TYPES.map((el) => (
                  <ProtocolItem
                    selected={values}
                    key={el}
                    protocol={el}
                    onPeek={(protocol) => setPeekedProtocol(protocol)}
                    onSelect={() =>
                      protocolHandler(el.toUpperCase() as SushiSwapProtocol)
                    }
                  />
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </HoverCard>
      </PopoverContent>
    </Popover>
  )
}

interface ProtocolItemProps {
  protocol: SushiSwapProtocol
  onSelect: () => void
  selected: SushiSwapProtocol[]
  onPeek: (model: SushiSwapProtocol) => void
}

const ProtocolItem: FC<ProtocolItemProps> = ({
  selected,
  protocol,
  onSelect,
  onPeek,
}) => {
  const ref = React.useRef<HTMLDivElement>(null)

  useMutationObserver(ref, (mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        if (mutation.attributeName === 'aria-selected') {
          onPeek(protocol)
        }
      }
    }
  })

  return (
    <CommandItem
      ref={ref}
      key={protocol}
      value={protocol}
      onSelect={onSelect}
      className="py-2 pl-8 pr-2 cursor-pointer"
    >
      {selected.includes(protocol) ? (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <CheckIcon
            strokeWidth={3}
            width={16}
            height={16}
            className="text-blue"
          />
        </span>
      ) : null}
      {PROTOCOL_MAP[protocol]}
    </CommandItem>
  )
}
