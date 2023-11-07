'use client'

import { classNames } from '../index'
import {
  ToastCaption,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastViewport,
  Toastnew,
} from './toastnew'
import { useToast } from './use-toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts
        .filter((el) => el.open)
        .map(function ({ id, caption, description, action, ...props }) {
          return (
            <Toastnew key={id} {...props}>
              {description && (
                <ToastDescription
                  className={classNames(
                    'max-h-[70px] group-hover:max-h-[unset]',
                  )}
                >
                  {caption ? (
                    <ToastCaption variant={props.variant}>
                      {caption}
                    </ToastCaption>
                  ) : null}
                  {description}
                  <ToastClose />
                </ToastDescription>
              )}
              {action}
            </Toastnew>
          )
        })}
      <ToastViewport />
    </ToastProvider>
  )
}
