import { Chain, ChainId, ChainKey } from 'sushi/chain'
import { NonStandardChain, NonStandardChainId } from '../config'

export const getNetworkName = (network: ChainId | NonStandardChainId) => {
  return typeof network === 'number'
    ? Chain.from(network)?.name
    : NonStandardChain[network].name
}

export const getNetworkKey = (network: ChainId | NonStandardChainId) => {
  return typeof network === 'number' ? ChainKey[network] : network
}

export const replaceNetworkSlug = (
  network: ChainId | NonStandardChainId,
  pathname: string,
) => {
  if (pathname.includes('/pool/')) {
    return `/${getNetworkKey(network)}/explore/pools`
  }
  const pathSegments = pathname.split('/')
  pathSegments[1] = getNetworkKey(network)
  return pathSegments.join('/')
}
