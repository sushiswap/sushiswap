import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sushiswap/ui'
import React, { FC, useState } from 'react'

import { ChainId } from 'sushi/chain'
import { ConcentratedPositionsTable } from './ConcentratedPositionsTable/ConcentratedPositionsTable'
import { PositionsTable } from './PositionsTable'
import { SmartPositionsTable } from './SmartPositionsTable'

const ITEMS: { id: string; value: string; children: React.ReactNode }[] = [
  {
    id: 'sushiswap-v3',
    value: 'v3',
    children: (
      <div className="flex items-center gap-2">
        <span>🍣</span>{' '}
        <span>
          SushiSwap <sup>v3</sup>
        </span>
      </div>
    ),
  },
  {
    id: 'sushiswap-v2',
    value: 'v2',
    children: (
      <div className="flex items-center gap-2">
        <span>🍣</span>{' '}
        <span>
          SushiSwap <sup>v2</sup>
        </span>
      </div>
    ),
  },
  {
    id: 'sushiswap-smart',
    value: 'smart',
    children: (
      <div className="flex items-center gap-2">
        <span>💡</span>
        <span>Smart Pool</span>
      </div>
    ),
  },
]

export const PositionsTab: FC<{ chainId: ChainId }> = ({ chainId }) => {
  const [tab, setTab] = useState('v3')

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={setTab} defaultValue="v3">
        <div className="flex justify-between mb-4">
          <div className="block sm:hidden">
            <Select value={tab} onValueChange={setTab}>
              <SelectTrigger>
                <SelectValue placeholder="Pool type" />
              </SelectTrigger>
              <SelectContent>
                {ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.children}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TabsList className="hidden sm:inline-flex">
            {ITEMS.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                testdata-id={item.id}
              >
                {item.children}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="v3">
          <ConcentratedPositionsTable
            chainId={chainId}
            hideNewPositionButton={true}
          />
        </TabsContent>
        <TabsContent value="v2">
          <PositionsTable
            chainId={chainId}
            rowLink={(row) => `/pool/${row.pool.id}`}
          />
        </TabsContent>
        <TabsContent value="smart">
          <SmartPositionsTable chainId={chainId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
