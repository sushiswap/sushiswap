export const getTokenInfo = (contractAddress: string) => {
  const query = JSON.stringify({
    query:
      'query ($contractAddress: String!) {\n  tron {\n    address(address: {is: $contractAddress}) {\n      smartContract {\n        currency {\n          decimals\n          name\n          symbol\n        }\n      }\n    }\n  }\n}',
    variables: `{\n  \"contractAddress\": \"${contractAddress}\"\n}`,
  })

  return query
}
