'use client'

import { VaultV1 } from '@sushiswap/graph-client/data-api'
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react'
import { Field } from 'src/lib/constants'
import { useSteerVaultReserves } from 'src/lib/wagmi/hooks/steer/useSteerVaultReserves'
import { Amount, Currency, Token, tryParseAmount } from 'sushi/currency'

interface State {
  independentField: Field
  typedValue: string
}

type Api = {
  onFieldAInput(typedValue: string): void
  onFieldBInput(typedValue: string): void
}

const initialState: State = {
  independentField: Field.CURRENCY_A,
  typedValue: '',
}

type Actions =
  | { type: 'resetMintState' }
  | { type: 'typeInput'; field: Field; typedValue: string }

const SteerPositionAddStateContext = createContext<State>(initialState)
const SteerPositionAddActionsContext = createContext<Api>(
  undefined as unknown as Api,
)

const reducer = (state: State, action: Actions): State => {
  switch (action.type) {
    case 'resetMintState':
      return initialState
    case 'typeInput': {
      return {
        ...state,
        independentField: action.field,
        typedValue: action.typedValue,
      }
    }
  }
}

export const SteerPositionAddProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const api = useMemo(() => {
    const onFieldAInput = (typedValue: string) =>
      dispatch({ type: 'typeInput', field: Field.CURRENCY_A, typedValue })

    const onFieldBInput = (typedValue: string) =>
      dispatch({ type: 'typeInput', field: Field.CURRENCY_B, typedValue })

    const resetMintState = () => dispatch({ type: 'resetMintState' })

    return {
      resetMintState,
      onFieldAInput,
      onFieldBInput,
    }
  }, [])

  return (
    <SteerPositionAddActionsContext.Provider value={api}>
      <SteerPositionAddStateContext.Provider value={state}>
        {children}
      </SteerPositionAddStateContext.Provider>
    </SteerPositionAddActionsContext.Provider>
  )
}

export const useSteerPositionAddState = () => {
  const context = useContext(SteerPositionAddStateContext)
  if (!context) {
    throw new Error(
      'Hook can only be used inside the Steer Position Add State Context',
    )
  }

  return context
}

export const useSteerPositionAddActions = () => {
  const context = useContext(SteerPositionAddActionsContext)

  if (!context) {
    throw new Error('Hook can only be used Steer Position Add Actions Context')
  }

  return context
}

type UseSteerPositionAddInfoProps = {
  // account: string | undefined
} & {
  vault: VaultV1 | undefined
}

export function useSteerPositionAddDerivedInfo({
  vault,
}: UseSteerPositionAddInfoProps) {
  const { independentField, typedValue } = useSteerPositionAddState()

  const [currencyA, currencyB] = useMemo(() => {
    if (!vault) return []

    return [new Token(vault.token0), new Token(vault.token1)]
  }, [vault])

  // currencies
  const currencies: { [_field in Field]: Currency } | undefined =
    useMemo(() => {
      if (!currencyA || !currencyB) return undefined

      return {
        [Field.CURRENCY_A]: currencyA,
        [Field.CURRENCY_B]: currencyB,
      }
    }, [currencyA, currencyB])

  const dependentField =
    independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  const { data: reserves, isLoading } = useSteerVaultReserves({
    vaultId: vault?.id,
    enabled: !!vault,
  })
  const [independentReserve, dependentReserve] = useMemo(() => {
    if (!reserves) return [undefined, undefined]

    if (independentField === Field.CURRENCY_A) {
      return [reserves.reserve0, reserves.reserve1]
    } else {
      return [reserves.reserve1, reserves.reserve0]
    }
  }, [independentField, reserves])

  // amounts
  const independentAmount: Amount<Currency> | undefined = tryParseAmount(
    typedValue,
    currencies?.[independentField],
  )
  const dependentAmount: Amount<Currency> | undefined = useMemo(() => {
    // we wrap the currencies just to get the price in terms of the other token
    const wrappedIndependentAmount = independentAmount?.wrapped
    const dependentCurrency =
      dependentField === Field.CURRENCY_B ? currencyB : currencyA

    if (
      independentReserve &&
      dependentReserve &&
      wrappedIndependentAmount &&
      dependentCurrency
    ) {
      if (independentReserve !== 0n && dependentReserve !== 0n) {
        return Amount.fromRawAmount(
          dependentCurrency,
          wrappedIndependentAmount
            .multiply(dependentReserve)
            .divide(independentReserve).quotient - 1n,
        )
      }
    }

    return undefined
  }, [
    independentAmount?.wrapped,
    dependentField,
    currencyB,
    currencyA,
    independentReserve,
    dependentReserve,
  ])

  const parsedAmounts: { [_ in Field]: Amount<Currency> } | undefined =
    useMemo(() => {
      if (!independentAmount || !dependentAmount) return undefined

      return {
        [Field.CURRENCY_A]:
          independentField === Field.CURRENCY_A
            ? independentAmount
            : dependentAmount,
        [Field.CURRENCY_B]:
          independentField === Field.CURRENCY_A
            ? dependentAmount
            : independentAmount,
      }
    }, [dependentAmount, independentAmount, independentField])

  return {
    vault,
    currencies,
    independentAmount,
    independentField,
    dependentAmount,
    dependentField,
    parsedAmounts,
    isLoading,
  }
}
