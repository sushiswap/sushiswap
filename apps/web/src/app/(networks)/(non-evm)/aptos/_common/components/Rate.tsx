import { classNames } from '@sushiswap/ui'
import {
  FC,
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { usePoolState } from '~aptos/pool/ui/pool/add/pool-add-provider/pool-add-provider'

interface RenderPayload {
  invert: boolean
  toggleInvert(): void
  content: ReactElement
}

interface Rate {
  children?: (payload: RenderPayload) => ReactNode
}

export const Rate: FC<Rate> = ({ children }) => {
  const { token0, token1, poolPairRatio, amount0, amount1 } = usePoolState()
  const noPairRatio = useMemo(() => {
    return Number(amount1) / Number(amount0)
  }, [amount0, amount1])
  const [invert, setInvert] = useState(false)

  const content = (
    <>
      {typeof poolPairRatio === 'number' ? (
        <>
          {invert ? (
            <>
              1 {token1?.symbol} = {1 / poolPairRatio} {token0?.symbol}
            </>
          ) : (
            <>
              1 {token0?.symbol} = {poolPairRatio} {token1?.symbol}
            </>
          )}
        </>
      ) : (
        <>
          {invert ? (
            <>
              1 {token1?.symbol} = {1 / noPairRatio} {token0?.symbol}
            </>
          ) : (
            <>
              1 {token0?.symbol} = {noPairRatio} {token1?.symbol}
            </>
          )}
        </>
      )}
    </>
  )

  const toggleInvert = useCallback(() => {
    setInvert((prevState) => !prevState)
  }, [])

  if (typeof children === 'function') {
    return <>{children({ invert, toggleInvert, content })}</>
  }

  return (
    <div
      className={classNames(
        'text-slate-300 hover:text-slate-200 flex justify-between border-t border-opacity-40 border-slate-700',
      )}
    >
      {/* <Typography variant="xs" className={classNames('cursor-pointer h-[36px] flex items-center gap-1')}>
        Rate
      </Typography> */}
      <span
        className={classNames(
          'text-xs cursor-pointer h-[36px] flex items-center ',
        )}
      >
        <button
          type="button"
          className="flex items-center h-full gap-1 font-medium"
          onClick={toggleInvert}
        >
          {content} <span className="text-slate-500">(${})</span>
        </button>
      </span>
    </div>
  )
}
