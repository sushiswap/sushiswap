import { InputTransactionData } from '@aptos-labs/wallet-adapter-core'

export function getAddLiquidityPayload(
  contractAddress: string,
  coinAddress0: string,
  coinAddress1: string,
  amount0: number,
  amount1: number,
  minimumIn: number,
  minimumOut: number,
): InputTransactionData {
  return {
    data: {
      typeArguments: [coinAddress0, coinAddress1],
      functionArguments: [amount0, amount1, minimumIn, minimumOut],
      function: `${contractAddress}::router::add_liquidity`,
    },
  }
}
