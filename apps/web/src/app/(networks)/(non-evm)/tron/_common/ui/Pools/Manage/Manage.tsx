import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sushiswap/ui'
import { useState } from 'react'
import { AddSection } from './AddSection'
import { RemoveSection } from './RemoveSection'

export const Manage = () => {
  const [tab, setTab] = useState<string>('add')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage</CardTitle>
        <CardDescription>Manage your position</CardDescription>
      </CardHeader>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <CardContent>
          <TabsList className="!flex">
            <TabsTrigger
              testdata-id="add-tab"
              value="add"
              className="flex flex-1"
            >
              Add
            </TabsTrigger>
            <TabsTrigger
              testdata-id="remove-tab"
              value="remove"
              className="flex flex-1"
            >
              Remove
            </TabsTrigger>
          </TabsList>
        </CardContent>
        <div className="px-6 pb-4">
          <Separator />
        </div>

        <TabsContent value="add">
          <CardContent>
            <AddSection />
          </CardContent>
        </TabsContent>
        <TabsContent value="remove">
          <CardContent>
            <RemoveSection />
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
