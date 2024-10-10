import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { ChipInput } from '@sushiswap/ui'
import { FC, useCallback, useState, useTransition } from 'react'

type PoolSearchBarProps = {
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
  placeholder: string
}

export const PoolSearchBar: FC<PoolSearchBarProps> = ({
  setQuery,
  query,
  placeholder,
}) => {
  const [isPending, startTransition] = useTransition()
  const [values, setValues] = useState<string[]>(query.split(' '))

  const onValueChange = useCallback(
    (values: string[]) => {
      const value = values?.[0]?.replaceAll(' ', '')
      setValues([value ?? ''])
      startTransition(() => setQuery(values.join(' ')))
    },
    [setQuery],
  )

  return (
    <div className="w-fit">
      <ChipInput
        size="sm"
        icon={MagnifyingGlassIcon}
        delimiters={[',', ' ', ';', ':', 'Enter']}
        variant="outline"
        values={isPending ? values : query.split(' ')}
        onValueChange={onValueChange}
        placeholder={placeholder}
        maxValues={1}
      />
    </div>
  )
}
