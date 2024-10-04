'use client'

import { useDebounce, useOnClickOutside } from '@sushiswap/hooks'
import { LinkInternal, SkeletonText, classNames } from '@sushiswap/ui'
import { useRef, useState } from 'react'

import { SearchIcon } from '@heroicons/react-v1/outline'
import { XIcon } from '@heroicons/react-v1/solid'
import { getFaqAnswerSearch } from '@sushiswap/graph-client/strapi'
import { useQuery } from '@tanstack/react-query'

export function SearchBox() {
  const ref = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState<string>('')
  const debouncedQuery = useDebounce(query, 300)
  const [open, setOpen] = useState(false)

  useOnClickOutside(ref, () => {
    setOpen(false)
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['faq-answers', debouncedQuery],
    queryFn: () => getFaqAnswerSearch({ search: debouncedQuery }),
  })

  return (
    <div className="flex flex-col gap-3 relative">
      <div className="z-10 flex w-full gap-4">
        <div
          ref={ref}
          onFocus={() => setOpen(true)}
          className={classNames(
            'rounded-xl w-full border',
            'border-black border-opacity-30 bg-neutral-100',
            'dark:bg-[#1F2535] dark:border-opacity-20 dark:border-slate-500',
          )}
        >
          <div className="flex items-center gap-2 pl-4 pr-3 h-14">
            <div className="flex gap-2 items-center w-full">
              <div className="w-6 h-6">
                <SearchIcon
                  width={24}
                  height={24}
                  className="dark:text-slate-500 text-neutral-950"
                />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions, keyword, articles..."
                className={classNames(
                  'w-full dark:placeholder:text-slate-500 placeholder:text-neutral-950',
                  'p-0 bg-transparent border-none focus:outline-none focus:ring-0 w-full truncate font-medium text-left text-base md:text-sm placeholder:font-normal',
                )}
              />
            </div>
            {query && (
              <XIcon
                onClick={() => setQuery('')}
                className="w-6 h-6 cursor-pointer dark:text-slate-500 text-neutral-950"
              />
            )}
          </div>
          <div
            className={classNames(
              open
                ? 'max-h-[335px] py-2 border-b border-l border-r -ml-px scroll'
                : 'max-h-[0px]',
              'z-[100]  rounded-b-xl flex flex-col gap-2 overflow-hidden transition-all absolute w-full -mt-4 ',
              'dark:bg-[#1F2535] dark:border-opacity-20 dark:border-slate-500',
              'border-black border-opacity-30 bg-neutral-100',
            )}
          >
            {isError ? (
              <div className="px-4 pt-4 pb-2 gap-2 flex justify-center w-full text-sm">
                An unexpected error has occured.
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold mt-4 px-4 text-slate-400">
                  Questions
                </p>
                <RowGroup entries={data?.answers || []} isLoading={isLoading} />
                <p className="text-sm font-semibold mt-4 px-4 text-slate-400">
                  Question Groups
                </p>
                <RowGroup
                  entries={data?.answerGroups || []}
                  isLoading={isLoading}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RowGroup({
  entries,
  isLoading,
}: {
  entries: { name: string; slug: string }[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="px-4 py-2 gap-2">
        <SkeletonText />
        <SkeletonText />
        <SkeletonText />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="px-4 py-2 gap-2 flex w-full text-sm">
        No results found.
      </div>
    )
  }

  return (
    <>
      {entries.map(({ name, slug }) => (
        <Row key={slug} name={name} slug={slug} />
      ))}
    </>
  )
}

function Row({ name, slug }: { name: string; slug: string }) {
  const content = (
    <div
      className="flex items-center gap-2 px-4 py-2 cursor-pointer dark:hover:bg-slate-700 hover:bg-neutral-200"
      key={slug}
    >
      <p className="font-medium">{name}</p>
    </div>
  )

  return <LinkInternal href={`/faq/${slug}`}>{content}</LinkInternal>
}
