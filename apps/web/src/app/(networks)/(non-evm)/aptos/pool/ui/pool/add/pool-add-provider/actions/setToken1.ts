import { Actions, State } from '../types'
import { swapTokens } from './swapTokens'

export function setToken1(state: State, action: Actions): State {
  if (action.type !== 'setToken1') throw new Error('Invalid action type')

  if (state.token0 === action.value) {
    return swapTokens(state, { type: 'swapTokens' })
  }

  return { ...state, token1: action.value }
}
