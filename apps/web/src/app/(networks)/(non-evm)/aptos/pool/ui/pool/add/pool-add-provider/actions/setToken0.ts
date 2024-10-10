import { Actions, State } from '../types'
import { swapTokens } from './swapTokens'

export function setToken0(state: State, action: Actions): State {
  if (action.type !== 'setToken0') throw new Error('Invalid action type')

  if (state.token1 === action.value) {
    return swapTokens(state, { type: 'swapTokens' })
  }

  return { ...state, token0: action.value }
}
