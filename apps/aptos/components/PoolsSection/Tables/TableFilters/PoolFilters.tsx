import { Tab } from '@headlessui/react'
import { Button } from '@sushiswap/ui'
import { FC } from 'react'
import { Search } from '../../../../../components/Search'

interface Props {
  showCategories: boolean
  farmHandler: () => void
  farmsOnly: boolean
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
}

export const PoolFilters: FC<Props> = ({
  showCategories = true,
  farmHandler,
  farmsOnly,
  query,
  setQuery,
}) => {
  return (
    <>
      <Tab.Group>
        <Tab.Panels>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex gap-4">
              <Search
                id="search"
                loading={false}
                onChange={setQuery}
                value={query ?? ''}
                delimiter=" "
              />
            </div>
            {showCategories && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-3 flex-wrap items-center">
                  <Button
                    onClick={farmHandler}
                    size="sm"
                    variant="outline"
                    color={farmsOnly ? 'blue' : 'default'}
                    className="flex gap-2.5"
                  >
                    <span>🧑�🌾</span> <span>Farms</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Tab.Panels>
      </Tab.Group>
    </>
  )
}
