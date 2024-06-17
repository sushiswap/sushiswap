'use client'

import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { FC, Suspense, useCallback, useMemo } from 'react'

import classNames from 'classnames'
import { Button } from './button'
import { LinkInternal } from './link'

const Params = () => {
  const searchParams = useSearchParams()!

  return searchParams.toString().length !== 0 ? (
    <div className="px-2 text-gray-500">
      <span>?</span>
      {Array.from(searchParams.entries()).map(([key, value], index) => {
        return (
          <React.Fragment key={key}>
            {index !== 0 ? <span>&</span> : null}
            <span className="px-1">
              <span
                key={key}
                className="animate-[highlight_1s_ease-in-out_1] text-gray-100"
              >
                {key}
              </span>
              <span>=</span>
              <span
                key={value}
                className="animate-[highlight_1s_ease-in-out_1] text-gray-100"
              >
                {value}
              </span>
            </span>
          </React.Fragment>
        )
      })}
    </div>
  ) : null
}

export const Breadcrumb: FC<{
  replace?: Record<string, string>
  truncate?: boolean
}> = ({ replace, truncate = true }) => {
  const pathname = usePathname()

  const replaceFn = useCallback(
    (text: string) => {
      if (!replace) return text

      return Object.entries(replace).reduce((acc, [from, to]) => {
        return acc.replace(new RegExp(from, 'g'), to)
      }, text)
    },
    [replace],
  )

  const items = useMemo(() => {
    const split = pathname.split('/').slice(1)

    return split.map((url) => ({
      url: url.replace(/%3A/g, ':'),
      label: replaceFn(url),
    }))
  }, [replaceFn, pathname])

  return (
    <div className="flex gap-x-1.5 items-center text-sm py-4">
      <Button
        variant="link"
        size="sm"
        className={classNames(
          '!font-normal hover:underline',
          pathname.split('/').length === 2
            ? '!text-gray-900 dark:!text-slate-50'
            : '!text-accent-foreground',
        )}
      >
        <LinkInternal href={`/${pathname.split('/')[1]}`}>Home</LinkInternal>
      </Button>

      {pathname ? (
        <>
          <ChevronRightIcon
            width={16}
            height={16}
            className="text-muted-foreground"
          />
          {items.map((segment, i) => {
            if (i === 0) return null

            const segments = [...items].slice(0, i + 1)
            const link = `/${segments.map(({ url }) => url).join('/')}`

            return (
              <React.Fragment key={segment.label}>
                <Button
                  variant="link"
                  size="sm"
                  key={segment.label}
                  className={classNames(
                    'hover:underline !inline font-normal capitalize whitespace-nowrap',
                    truncate ? 'max-w-[120px] truncate' : 'overflow-ellipsis',
                    i < items.length - 1
                      ? '!font-normal !text-muted-foreground'
                      : '!font-medium !text-gray-900 dark:!text-slate-50',
                  )}
                >
                  <LinkInternal href={link}>{segment.label}</LinkInternal>
                </Button>

                {i < items.length - 1 ? (
                  <ChevronRightIcon
                    width={16}
                    height={16}
                    className="text-muted-foreground"
                  />
                ) : null}
              </React.Fragment>
            )
          })}
        </>
      ) : null}

      <Suspense>
        <Params />
      </Suspense>
    </div>
  )
}
