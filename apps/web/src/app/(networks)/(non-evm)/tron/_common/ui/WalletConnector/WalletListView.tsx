import { List, SelectIcon } from '@sushiswap/ui'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import Image from 'next/image'
import { useWalletAdapters } from '~tron/_common/lib/hooks/useWalletAdapters'

export const WalletListView = () => {
  const { adapters } = useWalletAdapters()
  const { select } = useWallet()

  return (
    <List className="flex flex-col gap-1 !p-0">
      <List.Control className="bg-gray-100 ">
        {adapters.map((adapter) => (
          <List.MenuItem
            icon={() => (
              <Image
                src={adapter.icon}
                alt={adapter.name}
                width={25}
                height={25}
              />
            )}
            className="w-full items-center text-left justify-start flex"
            key={adapter.name}
            title={adapter.name}
            onClick={async () => {
              if (adapter.readyState === 'Found') {
                select(adapter.name)
              } else {
                window.open(adapter.url, '_blank')
              }
            }}
            hoverIcon={() => <SelectIcon className="-rotate-90" />}
          />
        ))}
      </List.Control>
    </List>
  )
}
