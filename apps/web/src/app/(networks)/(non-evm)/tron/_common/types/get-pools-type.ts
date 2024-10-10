import { IToken } from './token-type'

export type IPoolData = {
  token0Address: string
  token1Address: string
  pairAddress: string
}[]

export type IPoolDataResponse = {
  data: {
    tron: {
      smartContractEvents: {
        arguments: [
          {
            argument: 'token0'
            value: string
          },
          {
            argument: 'token1'
            value: string
          },
          {
            argument: 'pair'
            value: string
          },
          {
            argument: ''
            value: string
          },
        ]
        block: {
          height: number
        }
      }[]
    }
  }
}

export type IMyPositionData = {
  token0: IToken | undefined
  token1: IToken | undefined
  pairAddress: string | undefined
}

export type IReserveDataResponse = {
  data: {
    tron: {
      smartContractEvents: {
        arguments: [
          {
            argument: 'reserve0'
            value: string
          },
          {
            argument: 'reserve1'
            value: string
          },
        ]
        block: {
          height: number
        }
        smartContract: {
          address: {
            address: string
          }
        }
      }[]
    }
  }
}
