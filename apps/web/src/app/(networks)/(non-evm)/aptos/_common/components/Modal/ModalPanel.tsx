import { Dialog as HeadlessDialog, Transition } from '@headlessui/react'
import { useBreakpoint } from '@sushiswap/hooks'
import { ExtractProps, syncScrollLockSafeArea } from '@sushiswap/ui'
import React, { FC, Fragment, useEffect } from 'react'
import { ModalType, useModal } from './ModalProvider'

export type ModalPanelProps = Omit<
  ExtractProps<typeof HeadlessDialog>,
  'open' | 'onClose'
> & {
  tag: string
  modalType: ModalType
  afterLeave?(): void
  children?:
    | React.ReactNode
    | (({ close }: { close: () => void }) => React.ReactNode)
  variant?: 'transparent' | 'opaque'
}

export const ModalPanel: FC<ModalPanelProps> = ({
  tag,
  variant,
  modalType,
  children,
  afterLeave,
  ...rest
}) => {
  const { isOpen, close, register, unregister } = useModal(tag, modalType)
  const { unmount } = rest
  const { isMd } = useBreakpoint('md')

  // biome-ignore lint/correctness/useExhaustiveDependencies: Minddeft
  useEffect(() => {
    register()
    return () => {
      unregister()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // iOS body lock fix
  // This gets the current scroll position and sets it as negative top margin before setting position fixed on body
  // This is necessary because adding position fixed to body scrolls the page to the top
  useEffect(() => {
    if (!isMd) {
      if (isOpen) {
        document.body.style.top = `-${window.scrollY}px`
        document.body.style.position = 'fixed'
        document.body.style.left = '0'
        document.body.style.right = '0'
      } else {
        const scrollY = document.body.style.top
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
  }, [isMd, isOpen])

  // biome-ignore lint/correctness/useExhaustiveDependencies: Minddeft
  useEffect(syncScrollLockSafeArea, [isOpen])

  return (
    <Transition
      show={isOpen}
      as={Fragment}
      afterLeave={afterLeave}
      unmount={unmount}
    >
      <HeadlessDialog className="relative z-[1080]" onClose={close} {...rest}>
        {variant === 'transparent' && (
          <>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              unmount={unmount}
            >
              <div className="fixed inset-0 bg-black/10 paper dark:bg-black/40 transform-gpu" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex items-end justify-center min-h-full text-center sm:items-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  unmount={unmount}
                >
                  <HeadlessDialog.Panel className="w-full h-full max-w-md px-1">
                    <div className="p-4 overflow-hidden text-left max-w-md inline-block w-full h-full bg-gray-50/80 paper dark:bg-slate-800/80 shadow-xl align-middle transition-all transform rounded-t-2xl rounded-b-none sm:rounded-2xl relative'">
                      {typeof children === 'function'
                        ? children({ close })
                        : children}
                    </div>
                  </HeadlessDialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </>
        )}
        {variant === 'opaque' && (
          <>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              unmount={unmount}
            >
              <div className="fixed inset-0 dark:bg-slate-900 bg-gray-100" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto flex justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                unmount={unmount}
              >
                <HeadlessDialog.Panel className="w-full h-full max-w-xl px-1">
                  {typeof children === 'function'
                    ? children({ close })
                    : children}
                </HeadlessDialog.Panel>
              </Transition.Child>
            </div>
          </>
        )}
      </HeadlessDialog>
    </Transition>
  )
}
