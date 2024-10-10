import { InputTransactionData } from '@aptos-labs/wallet-adapter-core'

export function getSwapPayload(
  contractAddress: string,
  amount_in: number,
  routes: any,
  minimumOut: number,
): InputTransactionData {
  switch (routes.length) {
    case 2:
      return {
        data: {
          typeArguments: [routes[0], routes[1]],
          functionArguments: [amount_in, minimumOut],
          function: `${contractAddress}::router::swap_exact_input`,
        },
      }
    case 3:
      return {
        data: {
          typeArguments: [routes[0], routes[1], routes[2]],
          functionArguments: [amount_in, minimumOut],
          function: `${contractAddress}::router::swap_exact_input_doublehop`,
        },
      }
    case 4:
      return {
        data: {
          typeArguments: [routes[0], routes[1], routes[2], routes[3]],
          functionArguments: [amount_in, minimumOut],
          function: `${contractAddress}::router::swap_exact_input_triplehop`,
        },
      }
    case 5:
      return {
        data: {
          typeArguments: [
            routes[0],
            routes[1],
            routes[2],
            routes[3],
            routes[4],
          ],
          functionArguments: [amount_in, minimumOut],
          function: `${contractAddress}::router::swap_exact_input_quadruplehop`,
        },
      }
    default:
      throw new Error('Invalid number of routes')
  }
}
