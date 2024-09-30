import { useQuery } from '@tanstack/react-query'
import {
  DEFAULT_TOKEN_LIST,
  TRON,
  WTRX,
} from '~tron/_common/constants/token-list'
import { getTokenData } from '~tron/_common/lib/utils/getTokenData'
import {
  getValidTokenAddress,
  isAddress,
} from '~tron/_common/lib/utils/helpers'

export const useTokenInfo = ({
  tokenAddress,
  enabled = true,
}: { tokenAddress: string; enabled?: boolean }) => {
  return useQuery({
    queryKey: ['useTokenInfo2', { tokenAddress }],
    staleTime: Infinity,
    queryFn: async () => {
      if (tokenAddress === 'TRON') {
        return TRON
      }
      if (tokenAddress.toLowerCase() === WTRX.address.toLowerCase()) {
        return WTRX
      }

      if (!isAddress(tokenAddress)) throw new Error('invalid address')
      const foundInTokenList = DEFAULT_TOKEN_LIST.find(
        (i) =>
          getValidTokenAddress(i.address).toLowerCase() ===
          getValidTokenAddress(tokenAddress).toLowerCase(),
      )
      if (foundInTokenList) return foundInTokenList

      const tokenData = await getTokenData({ contractAddress: tokenAddress })

      return {
        address: tokenAddress,
        decimals: Number(tokenData?.decimals ?? 0),
        name: tokenData?.name ?? 'N/A',
        symbol: tokenData?.symbol ?? 'N/A',
        logoURI:
          DEFAULT_TOKEN_LIST.find(
            (i) =>
              getValidTokenAddress(i.address) ===
              getValidTokenAddress(tokenAddress),
          )?.logoURI ?? undefined,
      }
    },
    enabled: Boolean(enabled && tokenAddress),
  })
}
