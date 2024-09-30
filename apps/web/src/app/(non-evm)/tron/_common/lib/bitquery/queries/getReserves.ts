export const getReserves = (pairAddresses: string[]) => {
  if (pairAddresses.length === 0 || pairAddresses.length > 100) {
    throw new Error('Invalid pairAddresses length. Must be between 1 and 100.')
  }

  const pairAddressesString = pairAddresses
    .map((address) => `"${address}"`)
    .join(', ')

  const query = JSON.stringify({
    query:
      'query ($pairAddresses: [String!]) {\n  tron {\n    smartContractEvents(\n      smartContractEvent: {is: "Sync"}\n      smartContractAddress: {in: $pairAddresses}\n      options: {desc: "block.height", limitBy: {limit: 1, each: "smartContract.address.address"}}\n    ) {\n      arguments {\n        argument\n        value\n      }\n      block {\n        height\n      }\n      smartContract {\n        address {\n          address\n        }\n      }\n    }\n  }\n}\n',
    variables: `{\n  \"pairAddresses\": [\n    ${pairAddressesString}\n  ]\n}`,
  })

  return query
}
