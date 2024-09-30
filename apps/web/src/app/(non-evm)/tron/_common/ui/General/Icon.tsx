import { cloudinaryLogoFetchLoader } from '@sushiswap/ui'
import Image from 'next/image'
import { hashStringToColor } from '~tron/_common/lib/utils/formatters'
import { IToken } from '~tron/_common/types/token-type'

type IconProps = {
  currency: IToken | undefined
  height?: number
  width?: number
}

export const Icon = ({ currency, height = 40, width = 40 }: IconProps) => {
  return (
    <>
      {currency?.logoURI ? (
        <div
          style={{ width, height }}
          className="relative flex shrink-0 overflow-hidden rounded-full"
        >
          <Image
            loader={cloudinaryLogoFetchLoader}
            src={currency.logoURI}
            alt={currency.symbol}
            height={height}
            width={width}
            className="aspect-square h-full w-full"
          />
        </div>
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
