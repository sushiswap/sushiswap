import { isValidNumberInput } from '~aptos/_common/lib/common/is-valid-number-input'
import { Actions, State } from '../types'

export function setAmount1(state: State, action: Actions): State {
  if (action.type !== 'setAmount1') throw new Error('Invalid action type')

  if (!isValidNumberInput(action.value)) {
    return state
  }

  if (!parseFloat(action.value)) {
    return { ...state, amount0: '', amount1: action.value }
  }

  if (state.poolPairRatio) {
    const decimalDiff = state.token1.decimals - state.token0.decimals

    const amount1Number = parseFloat(action.value)
    const amount0Number =
      (amount1Number / state.poolPairRatio) * 10 ** decimalDiff

    return {
      ...state,
      amount1: action.value,
      amount0: String(amount0Number),
    }
  }

  return { ...state, amount1: action.value }
}
