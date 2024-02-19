export function liquidityArgs(
  coinAddress0: string,
  coinAddress1: string,
  amount0: number,
  amount1: number,
  minimumIn: number,
  minimumOut: number,
) {
  return {
    type: 'entry_function_payload',
    type_arguments: [coinAddress0, coinAddress1],
    arguments: [amount0, amount1, minimumIn, minimumOut],
    function: `${process.env['NEXT_PUBLIC_SWAP_CONTRACT']}::router::add_liquidity`,
  }
}
