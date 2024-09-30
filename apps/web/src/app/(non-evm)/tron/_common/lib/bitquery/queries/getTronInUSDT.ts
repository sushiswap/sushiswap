export const getTronInUSDT = () => {
  const query = JSON.stringify({
    query:
      'query GetTronInUSDT {\n  tron {\n    dexTrades(\n      baseCurrency: {is: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR"}\n      quoteCurrency: {is: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"}\n      options: {limit: 1, desc: "block.timestamp.time"}\n    ) {\n      block {\n        timestamp {\n          time(format: "%Y-%m-%d %H:%M:%S")\n        }\n      }\n      baseCurrency {\n        address\n      }\n      quoteCurrency {\n        address\n      }\n      quotePrice\n    }\n  }\n}\n',
    variables: '{}',
  })

  return query
}
