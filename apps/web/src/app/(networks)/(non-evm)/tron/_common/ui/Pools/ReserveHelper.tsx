import { useEffect } from 'react'
import { useReserves } from '~tron/_common/lib/hooks/useReserves'
import { getValidTokenAddress } from '~tron/_common/lib/utils/helpers'
import { usePoolDispatch, usePoolState } from './pool-provider'

export const ReserveHelper = () => {
  const { token0, token1, pairAddress } = usePoolState()
  const { setReserve0, setReserve1 } = usePoolDispatch()

  const { data, isLoading } = useReserves({
    pairAddress: pairAddress,
    token0: token0,
    token1: token1,
  })

  useEffect(() => {
    if (!pairAddress) {
      setReserve0('')
      setReserve1('')
    }
    if (
      !isLoading &&
      data &&
      data?.length > 0 &&
      pairAddress &&
      token0 &&
      token1
    ) {
      const reserve0 = data.find(
        (d) =>
          getValidTokenAddress(d.address!) ===
          getValidTokenAddress(token0?.address),
      )
      const reserve1 = data.find(
        (d) =>
          getValidTokenAddress(d.address!) ===
          getValidTokenAddress(token1?.address),
      )
      setReserve0(reserve0?.reserve ?? '')
      setReserve1(reserve1?.reserve ?? '')
    }
  }, [data, isLoading, pairAddress, token0, token1, setReserve0, setReserve1])

  return null
}
