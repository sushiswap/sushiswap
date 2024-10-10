import { DEFAULT_SLIPPAGE } from 'sushi/config'
import { Actions, State } from '../types'
import { setSlippageAmount0 } from './setSlippageAmount0'
import { setSlippageAmount1 } from './setSlippageAmount1'

export function setSlippageTolerance(state: State, action: Actions): State {
  if (action.type !== 'setSlippageTolerance')
    throw new Error('Invalid action type')

  state = {
    ...state,
    slippageTolerance: parseSlippageTolerance(String(action.value)),
  }

  const { slippageAmount0 } = setSlippageAmount0(state, {
    type: 'setSlippageAmount0',
    value: Number(state.amount1),
  })

  const { slippageAmount1 } = setSlippageAmount1(state, {
    type: 'setSlippageAmount1',
    value: Number(state.amount1),
  })

  return {
    ...state,
    slippageAmount0,
    slippageAmount1,
  }
}

export function parseSlippageTolerance(value: string, auto = DEFAULT_SLIPPAGE) {
  return parseFloat(value === 'AUTO' ? auto : value) / 100
}
