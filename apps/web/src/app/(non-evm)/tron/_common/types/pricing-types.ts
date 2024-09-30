export type ITronInUSDTResponse = {
  data: {
    tron: {
      dexTrades: [
        {
          block: {
            timestamp: {
              time: string
              // 2024-05-31 15:52:36 in this format
            }
          }
          baseCurrency: {
            address: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR'
          }
          quoteCurrency: {
            address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
          }
          quotePrice: number
        },
      ]
    }
  }
}
