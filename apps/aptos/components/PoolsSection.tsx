import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Tab } from '@headlessui/react'
import { Button, Container } from '@sushiswap/ui'
import React, { Fragment, useState } from 'react'
import { PoolFilters } from './PoolsSection/Tables'
import { PoolsTable } from './PoolsSection/Tables/PoolsTable'
import { PositionsTable } from './PoolsSection/Tables/PositionsTable'

export default function PoolsSection() {
  const [tab, setTab] = useState<number>(0)
  const { account } = useWallet()
  const [farmsOnly, setFarmsOnly] = useState<boolean>(false)
  const [query, setQuery] = useState<string>('')
  const farmHandler = () => {
    setFarmsOnly((farmsOnly) => !farmsOnly)
  }

  return (
    <div className="flex flex-col">
      <Tab.Group defaultIndex={0} selectedIndex={tab} onChange={setTab}>
        <Container maxWidth="7xl" className="px-4 mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Tab as={Fragment}>
              {({ selected }) => (
                <Button
                  size="sm"
                  variant={selected ? 'outline' : 'ghost'}
                  color="default"
                  className="!rounded-full !h-[36px]"
                >
                  All
                </Button>
              )}
            </Tab>
            {account?.address && (
              <>
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <Button
                      size="sm"
                      variant={selected ? 'outline' : 'ghost'}
                      color="default"
                      testId="my-positions"
                      className="!rounded-full !h-[36px]"
                    >
                      My Positions
                    </Button>
                  )}
                </Tab>
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <Button
                      size="sm"
                      variant={selected ? 'outline' : 'ghost'}
                      color="default"
                      className="!rounded-full !h-[36px]"
                      testId="my-rewards"
                    >
                      My Rewards
                    </Button>
                  )}
                </Tab>
              </>
            )}
          </div>
        </Container>
        <Tab.Panels className="bg-gray-50 dark:bg-white/[0.02] py-4">
          <Container maxWidth="7xl" className="px-4 mx-auto">
            <PoolFilters
              showCategories={tab === 0}
              farmHandler={farmHandler}
              farmsOnly={farmsOnly}
              query={query}
              setQuery={setQuery}
            />
          </Container>
          <Tab.Panel>
            <Container maxWidth="7xl" className="px-4 mx-auto">
              <PoolsTable />
            </Container>
          </Tab.Panel>
          <Tab.Panel>
            <PositionsTable />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
