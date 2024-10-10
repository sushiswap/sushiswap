'use client'

import React, {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

export enum ModalType {
  Regular = 0,
  Review = 1,
  Confirm = 2,
}

interface ModalContext {
  state: Record<string, boolean>
  open(tag: string): void
  close(tag: string): void
  register(tag: string): void
  unregister(tag: string): void
  setState: Dispatch<SetStateAction<Record<string, boolean>>>
}

const ModalContext = createContext<ModalContext | undefined>(undefined)

export interface ModalProviderProps {
  children: ReactNode
}

export const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
  const [state, setState] = useState<Record<string, boolean>>({})

  const open = useCallback((tag: string) => {
    setState((prev) => {
      const state = { ...prev }
      const newState = Object.entries(state).reduce<Record<string, boolean>>(
        (acc, [k]) => {
          acc[k] = false
          return acc
        },
        {},
      )

      newState[tag] = true
      return newState
    })
  }, [])

  const close = useCallback((tag: string) => {
    setState((prev) => ({
      ...prev,
      [tag]: false,
    }))
  }, [])

  const register = useCallback((tag: string) => {
    setState((prev) => ({
      ...prev,
      [tag]: false,
    }))
  }, [])

  const unregister = useCallback((tag: string) => {
    setState((prev) => {
      const state = { ...prev }
      delete state[tag]
      return state
    })
  }, [])

  return (
    <ModalContext.Provider
      value={useMemo(
        () => ({ state, open, close, register, unregister, setState }),
        [state, open, close, register, unregister],
      )}
    >
      {children}
    </ModalContext.Provider>
  )
}

type UseModal<T> = T extends ModalType.Review
  ? {
      isOpen: boolean
      open(): void
      close(): void
      register(): void
      unregister(): void
      confirm(): void
    }
  : {
      isOpen: boolean
      open(): void
      close(): void
      register(): void
      unregister(): void
    }

export const useModal = <T extends ModalType>(
  tag: string,
  type?: T,
): UseModal<T> => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('Hook can only be used inside Modal Context')
  }

  const _tag = `${tag}${
    type === ModalType.Regular
      ? ''
      : type === ModalType.Confirm
        ? '-confirm'
        : '-review'
  }`

  return useMemo(() => {
    const base = {
      isOpen: Boolean(context.state[_tag]),
      open: () => context.open(_tag),
      close: () => context.close(_tag),
      register: () => context.register(_tag),
      unregister: () => context.unregister(_tag),
    }

    if (type === ModalType.Review) {
      return {
        ...base,
        confirm: () =>
          context.setState((prev) => {
            const state = { ...prev }
            state[`${tag}-review`] = false
            state[`${tag}-confirm`] = true

            return state
          }),
      } as UseModal<T>
    } else {
      return base as UseModal<T>
    }
  }, [_tag, context, tag, type])
}
