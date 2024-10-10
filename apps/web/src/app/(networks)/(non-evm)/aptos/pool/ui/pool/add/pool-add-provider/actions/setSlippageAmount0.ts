import { Actions, State } from '../types'

export function setSlippageAmount0(state: State, action: Actions): State {
  if (action.type !== 'setSlippageAmount0')
    throw new Error('Invalid action type')

  return {
    ...state,
    slippageAmount0: action.value - action.value * state.slippageTolerance,
  }
}
