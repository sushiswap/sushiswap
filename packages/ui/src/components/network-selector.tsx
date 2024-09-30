'use client'

import React, { ReactNode, useMemo, useState } from 'react'
import { Chain, ChainId } from 'sushi/chain'

import Link from 'next/link'
import { NetworkIcon } from '../icons/NetworkIcon'
// import { TronCircle } from '../icons/network/circle/TronCircle'
import { AptosCircle } from '../icons/network/circle/AptosCircle'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './command'
import { Popover, PopoverContent, PopoverPrimitive } from './popover'

export type NetworkSelectorOnSelectCallback<T extends number = ChainId> = (
  chainId: T,
  close: () => void,
) => void

const PREFERRED_CHAINID_ORDER: ChainId[] = [
  ChainId.ETHEREUM,
  ChainId.BSC,
  ChainId.ARBITRUM,
  ChainId.ARBITRUM_NOVA,
  ChainId.BASE,
  ChainId.AVALANCHE,
  ChainId.POLYGON,
  ChainId.BLAST,
  ChainId.SCROLL,
  ChainId.OPTIMISM,
  ChainId.LINEA,
  ChainId.MANTLE,
  // ChainId.MODE,
  // APTOS?
  ChainId.CRONOS,
  // ChainId.ZKLINK,
  ChainId.CORE,
  ChainId.GNOSIS,
  ChainId.ROOTSTOCK,
  ChainId.KAVA,
  ChainId.CELO,
  ChainId.FANTOM,
  ChainId.ZKSYNC_ERA,
  ChainId.FILECOIN,
  ChainId.METIS,
  ChainId.TELOS,
  ChainId.POLYGON_ZKEVM,
  ChainId.ZETACHAIN,
]

export interface NetworkSelectorProps<T extends number = ChainId> {
  showNonEvm?: boolean
  hideNetworkName?: boolean
  networks: readonly T[]
  selected: T
  onSelect: NetworkSelectorOnSelectCallback<T>
  children: ReactNode
}

const NEW_CHAINS: number[] = [
  ChainId.ZKSYNC_ERA,
  ChainId.MANTLE,
] satisfies ChainId[]

function Aptos() {
  return (
    <Link href="/aptos/swap" rel="noopener noreferrer">
      <CommandItem className="cursor-pointer">
        <div className="flex items-center gap-2">
          <AptosCircle width={22} height={22} />
          Aptos
        </div>
      </CommandItem>
    </Link>
  )
}

// function Tron() {
//   return (
//     <Link href="/tron/swap" rel="noopener noreferrer">
//       <CommandItem className="cursor-pointer">
//         <div className="flex items-center gap-2">
//           <TronCircle width={22} height={22} />
//           Tron
//         </div>
//       </CommandItem>
//     </Link>
//   )
// }

const NetworkSelector = <T extends number>({
  showNonEvm = false,
  onSelect,
  networks = [],
  children,
}: Omit<NetworkSelectorProps<T>, 'variant'>) => {
  const [open, setOpen] = useState(false)

  const _networks = useMemo(() => {
    const INCLUDED_PREFERRED_CHAIN_IDS = PREFERRED_CHAINID_ORDER.filter((el) =>
      networks.includes(el as T),
    )
    return Array.from(new Set([...INCLUDED_PREFERRED_CHAIN_IDS, ...networks]))
  }, [networks])

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
            {showNonEvm ? (
              <>
                <Aptos />
                {/* <Tron /> */}
              </>
            ) : null}
            {_networks
              .sort((a) => (NEW_CHAINS.includes(a) ? -1 : 0))
              .map((el) => (
                <CommandItem
                  className="cursor-pointer"
                  testdata-id={`network-selector-${el}`}
                  value={`${Chain.from(el)?.name}__${el}`}
                  key={el}
                  onSelect={(value) =>
                    onSelect(+value.split('__')[1] as T, () => setOpen(false))
                  }
                >
                  <div className="flex items-center gap-2">
                    <NetworkIcon chainId={el} width={22} height={22} />
                    {NEW_CHAINS.includes(el) ? (
                      <>
                        {Chain.from(el)?.name}
                        <div className="text-[10px] italic rounded-full px-[6px] bg-gradient-to-r from-blue to-pink text-white font-bold">
                          NEW
                        </div>
                      </>
                    ) : (
                      Chain.from(el)?.name
                    )}
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { NetworkSelector }
