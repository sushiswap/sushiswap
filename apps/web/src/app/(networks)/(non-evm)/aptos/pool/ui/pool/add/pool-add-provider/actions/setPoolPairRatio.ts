import { Actions, State } from '../types'
import { setAmount0 } from './setAmount0'
import { setAmount1 } from './setAmount1'

export function setPoolPairRatio(state: State, action: Actions): State {
  if (action.type !== 'setPoolPairRatio') throw new Error('Invalid action type')

  state = {
    ...state,
    poolPairRatio: action.value,
  }

  if (state.independentField === 'token0' && state.amount0) {
    const { amount1 } = setAmount0(state, {
      type: 'setAmount0',
      value: state.amount0,
    })

    return {
      ...state,
      amount1,
    }
  }

  if (state.independentField === 'token1' && state.amount1) {
    const { amount0 } = setAmount1(state, {
      type: 'setAmount1',
      value: state.amount1,
    })

    return {
      ...state,
      amount0,
    }
  }

  return state
}
