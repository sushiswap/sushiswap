export type AptosPool = {
  id: string
  type: string
  data: {
    balance_x: {
      value: string
    }
    balance_y: {
      value: string
    }
    burn_cap: {
      dummy_field: boolean
    }
    creator: string
    fee_amount: {
      value: string
    }
    freeze_cap: {
      dummy_field: boolean
    }
    k_last: string
    mint_cap: {
      dummy_field: boolean
    }
    token_x_details: {
      token_address: string
      decimals: number
      name: string
      symbol: string
    }
    token_y_details: {
      token_address: string
      decimals: number
      name: string
      symbol: string
    }
  }
}

export type Pool = ReturnType<typeof convertPoolToSushiPool>

export function convertPoolToSushiPool(pool: AptosPool) {
  const token0 = {
    address: pool.data.token_x_details.token_address,
    decimals: pool.data.token_x_details.decimals,
    name: pool.data.token_x_details.name,
    symbol: pool.data.token_x_details.symbol,
  }
  const token1 = {
    address: pool.data.token_y_details.token_address,
    decimals: pool.data.token_y_details.decimals,
    name: pool.data.token_y_details.name,
    symbol: pool.data.token_y_details.symbol,
  }

  const reserve0 = pool.data.balance_x.value
  const reserve1 = pool.data.balance_y.value

  return {
    id: `${token0.address}, ${token1.address}`,
    type: pool.type,
    token0,
    token1,
    reserve0,
    reserve1,
  }
}
