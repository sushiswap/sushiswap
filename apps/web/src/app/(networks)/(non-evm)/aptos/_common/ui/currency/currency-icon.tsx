import React from 'react'
import { Token } from '~aptos/_common/lib/types/token'

interface CurrencyIcon {
  currency: Token | undefined
  height?: number
  width?: number
}

function djb2(str: string) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i) /* hash * 33 + c */
  }
  return hash
}

function hashStringToColor(str: string) {
  const hash = djb2(str)
  const r = (hash & 0xff0000) >> 16
  const g = (hash & 0x00ff00) >> 8
  const b = hash & 0x0000ff

  return (
    // biome-ignore lint/style/useTemplate: Minddeft
    '#' +
    // biome-ignore lint/style/useTemplate: Minddeft
    ('0' + r.toString(16)).substr(-2) +
    // biome-ignore lint/style/useTemplate: Minddeft
    ('0' + g.toString(16)).substr(-2) +
    // biome-ignore lint/style/useTemplate: Minddeft
    ('0' + b.toString(16)).substr(-2)
  )
}

export const CurrencyIcon = ({
  currency,
  height = 40,
  width = 40,
}: CurrencyIcon) => {
  return (
    <>
      {currency?.logoURI ? (
        <img
          src={currency?.logoURI}
          alt=""
          className="rounded-full"
          height={height}
          width={width}
        />
      ) : (
        <div
          className="text-xs text-white font-bold rounded-full flex items-center justify-center bg-gradient-to-b from-gray-300 to-gray-200 dark:from-blue-700 dark:to-blue-900"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            background: hashStringToColor(
              `${currency?.symbol} ${currency?.name}` ?? '??',
            ),
          }}
        >
          {currency?.symbol?.substring(0, 2) ?? '??'}
        </div>
      )}
    </>
  )
}
