import {
  PromiseNotification,
  ResolvedNotification,
  createNotification,
} from '@sushiswap/dexie'
import { nanoid } from 'nanoid'
import React from 'react'
import { ToastOptions, toast } from 'react-toastify'

import { ToastButtons } from './ToastButtons'
import { ToastCompleted } from './ToastCompleted'
import { ToastContent } from './ToastContent'
import { ToastFailed } from './ToastFailed'
import { ToastInfo } from './ToastInfo'
import { ToastPending } from './ToastPending'

export const TOAST_OPTIONS: ToastOptions = {
  position: 'top-right',
  autoClose: false,
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
  closeButton: false,
  icon: false,
}

export const createToast = (props: PromiseNotification) => {
  const onDismiss = () => toast.dismiss(props.txHash)

  // Spawn new toasts based on promise result
  props.promise
    .then(() => {
      setTimeout(onDismiss, 3000)

      // Spawn success notification
      const toastId = `completed:${props.txHash}`
      toast(
        <ToastCompleted
          {...props}
          summary={props.summary.completed}
          onDismiss={() => toast.dismiss(toastId)}
        />,
        {
          ...TOAST_OPTIONS,
          toastId,
          autoClose: 5000,
        },
      )
    })
    .catch((e) => {
      console.error(e)

      setTimeout(onDismiss, 3000)

      // Spawn error notification
      const toastId = `failed:${props.txHash}`
      toast(
        <ToastFailed
          {...props}
          summary={props.summary.failed}
          onDismiss={() => toast.dismiss(toastId)}
        />,
        {
          ...TOAST_OPTIONS,
          toastId,
        },
      )
    })

  toast(
    <ToastPending
      {...props}
      summary={props.summary.pending}
      onDismiss={onDismiss}
    />,
    {
      ...TOAST_OPTIONS,
      toastId: props.txHash,
    },
  )

  return createNotification(props)
}

export const createErrorToast = (
  message: string | undefined,
  code: boolean,
) => {
  if (!message) return

  const toastId = `failed:${nanoid()}`
  toast(
    <>
      <ToastContent summary={message} code={code} />
      <ToastButtons onDismiss={() => toast.dismiss(toastId)} />
    </>,
    {
      ...TOAST_OPTIONS,
      toastId,
    },
  )
}

export const createSuccessToast = (props: ResolvedNotification) => {
  const toastId = `completed:${props.txHash}`
  toast(
    <ToastCompleted {...props} onDismiss={() => toast.dismiss(toastId)} />,
    {
      ...TOAST_OPTIONS,
      toastId,
      autoClose: 5000,
    },
  )

  return createNotification(props)
}

export const createFailedToast = (props: ResolvedNotification) => {
  const toastId = `failed:${props.txHash}`
  toast(<ToastFailed {...props} onDismiss={() => toast.dismiss(toastId)} />, {
    ...TOAST_OPTIONS,
    toastId,
    autoClose: 5000,
  })

  return createNotification(props)
}

export const createInfoToast = (props: ResolvedNotification) => {
  const toastId = `info:${props.txHash}`
  toast(<ToastInfo {...props} onDismiss={() => toast.dismiss(toastId)} />, {
    ...TOAST_OPTIONS,
    toastId,
    autoClose: 5000,
  })

  return createNotification(props)
}
