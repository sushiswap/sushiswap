export const getAllPools = (factoryContract: string) => {
  const query = JSON.stringify({
    query:
      'query ($factoryContract: String!) {\n  tron {\n    smartContractEvents(\n      smartContractEvent: {is: "PairCreated"}\n      smartContractAddress: {is: $factoryContract}\n      options: {desc: "block.height"}\n    ) {\n      arguments {\n        argument\n        value\n      }\n      block {\n        height\n      }\n    }\n  }\n}\n',
    variables: `{\n  \"factoryContract\": \"${factoryContract}\"\n}`,
  })

  return query
}
