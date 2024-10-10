import { isValidNumberInput } from '~aptos/_common/lib/common/is-valid-number-input'
import { Actions, State } from '../types'

export function setAmount0(state: State, action: Actions): State {
  if (action.type !== 'setAmount0') throw new Error('Invalid action type')

  if (!isValidNumberInput(action.value)) {
    return state
  }

  if (!parseFloat(action.value)) {
    return { ...state, amount0: action.value, amount1: '' }
  }

  if (state.poolPairRatio) {
    const decimalDiff = state.token0.decimals - state.token1.decimals

    const amount0Number = parseFloat(action.value)
    const amount1Number =
      amount0Number * state.poolPairRatio * 10 ** decimalDiff

    return {
      ...state,
      amount0: action.value,
      amount1: String(amount1Number),
    }
  }

  return { ...state, amount0: action.value }
}
