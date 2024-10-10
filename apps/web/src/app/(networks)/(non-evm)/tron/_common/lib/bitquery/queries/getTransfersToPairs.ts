export const getTransfersToPairs = (
  pairAddresses: string[],
  walletAddress: string,
) => {
  if (pairAddresses.length === 0 || pairAddresses.length > 100) {
    throw new Error('Invalid pairAddresses length. Must be between 1 and 100.')
  }

  const pairAddressesString = pairAddresses
    .map((address) => `"${address}"`)
    .join(', ')

  const query = JSON.stringify({
    query:
      'query ($pairAddresses: [String!], $walletAddress: String!) {\n  tron {\n    transfers(\n      sender: {is: $walletAddress}\n      receiver: {in: $pairAddresses}\n    ) {\n      currency {\n        address\n        decimals\n        name\n        symbol\n      }\n      txHash\n      receiver {\n        address\n      }\n    }\n  }\n}\n',
    variables: `{\n  \"walletAddress\": \"${walletAddress}\",\n  \"pairAddresses\": [\n    ${pairAddressesString}\n  ]\n}`,
  })

  return query
}
