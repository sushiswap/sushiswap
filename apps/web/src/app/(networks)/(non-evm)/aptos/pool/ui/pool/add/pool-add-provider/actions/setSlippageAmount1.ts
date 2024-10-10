import { Actions, State } from '../types'

export function setSlippageAmount1(state: State, action: Actions): State {
  if (action.type !== 'setSlippageAmount1')
    throw new Error('Invalid action type')

  return {
    ...state,
    slippageAmount1: action.value - action.value * state.slippageTolerance,
  }
}
