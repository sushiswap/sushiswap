import { IS_TESTNET } from '~tron/_common/constants/is-testnet'

export const getTronscanAddressLink = (address: string) => {
  if (IS_TESTNET) {
    return `https://shasta.tronscan.org/#/address/${address}`
  } else {
    return `https://tronscan.org/#/address/${address}`
  }
}

export const getTronscanTxnLink = (txnHash: string) => {
  if (IS_TESTNET) {
    return `https://shasta.tronscan.org/#/transaction/${txnHash}`
  } else {
    return `https://tronscan.org/#/transaction/${txnHash}`
  }
}
