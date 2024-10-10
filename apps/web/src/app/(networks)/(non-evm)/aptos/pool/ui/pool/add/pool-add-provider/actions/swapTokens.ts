import { Actions, State } from '../types'

export function swapTokens(state: State, action: Actions): State {
  if (action.type !== 'swapTokens') throw new Error('Invalid action type')

  return { ...state, token0: state.token1, token1: state.token0 }
}
