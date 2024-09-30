import { useQuery } from '@tanstack/react-query'
import { decodeAbiParameters } from 'viem/utils'
import { TRON_MULTICALL_ABI } from '~tron/_common/constants/abis/tron-multicall'
import {
  FACTORY_CONTRACT,
  MULTICALL_CONTRACT,
} from '~tron/_common/constants/contracts'
import { INTERMEDIATE_TOKEN } from '~tron/_common/constants/token-list'
import {
  getBase58Address,
  getIfWrapOrUnwrap,
  getValidTokenAddress,
  isContract,
} from '~tron/_common/lib/utils/helpers'
import { IToken } from '~tron/_common/types/token-type'
import { useTronWeb } from './useTronWeb'

const abi = {
  outputs: [{ type: 'address' }],
  constant: true,
  inputs: [{ type: 'address' }, { type: 'address' }],
  name: 'getPair',
  stateMutability: 'View',
  type: 'Function',
}

const functionSignature = 'getPair(address,address)'

const getPairsToCall = (
  token0Address: string,
  token1Address: string,
  intermediateTokenAddress: string,
) => {
  return [
    { token0Address, token1Address },
    { token0Address, token1Address: intermediateTokenAddress },
    { token0Address: intermediateTokenAddress, token1Address },
  ]
}

export const useRoutes = ({
  token0,
  token1,
}: { token0: IToken; token1: IToken }) => {
  const { tronWeb } = useTronWeb()
  return useQuery({
    queryKey: ['useRoutes', { token0, token1 }],
    queryFn: async () => {
      const swapType = getIfWrapOrUnwrap(token0, token1)
      if (swapType === 'wrap' || swapType === 'unwrap') {
        return {
          pairs: [],
          route: [],
        }
      }

      const functionSelector = tronWeb.sha3(functionSignature).slice(0, 10) // first 4 bytes
      const token0Address = getValidTokenAddress(token0.address)
      const token1Address = getValidTokenAddress(token1.address)
      const intermediateTokenAddress = INTERMEDIATE_TOKEN.address

      const pairsToCall = getPairsToCall(
        token0Address,
        token1Address,
        intermediateTokenAddress,
      )

      const calls = pairsToCall.map(({ token0Address, token1Address }) => {
        const parameters = tronWeb.utils.abi.encodeParamsV2ByABI(abi, [
          token0Address,
          token1Address,
        ])
        const callData = functionSelector + parameters.replace(/^0x/, '')

        return [FACTORY_CONTRACT, callData]
      })

      tronWeb.setAddress(MULTICALL_CONTRACT)
      const multicallInstance = await tronWeb.contract(
        TRON_MULTICALL_ABI,
        MULTICALL_CONTRACT,
      )

      const _multicallReturn = await multicallInstance.aggregate(calls).call()
      const { returnData } = _multicallReturn

      const _pairs: string[] = []
      for (let i = 0; i < returnData.length; i++) {
        const pairAddress = decodeAbiParameters(
          [
            {
              type: 'address',
            },
          ],
          returnData[i],
        )
        _pairs.push(getBase58Address(pairAddress?.[0]))
      }

      //using multicall, check if there is a direct pair (index 0), if not check if there is a pair with intermediate token (index 1 or 2)
      if (await isContract(tronWeb, _pairs?.[0])) {
        return {
          pairs: [_pairs?.[0]],
          route: [token0.address, token1.address],
        }
      }
      if (
        (await isContract(tronWeb, _pairs?.[1])) &&
        (await isContract(tronWeb, _pairs?.[2]))
      ) {
        return {
          pairs: [_pairs?.[1], _pairs?.[2]],
          route: [token0.address, INTERMEDIATE_TOKEN.address, token1.address],
        }
      }
      return {
        pairs: [],
        route: [],
      }
    },
    enabled: !!token0 && !!token1 && !!tronWeb,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
}
