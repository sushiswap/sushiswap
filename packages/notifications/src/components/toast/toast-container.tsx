'use client'

import 'react-toastify/dist/ReactToastify.css'

import type { FC } from 'react'
import { ToastContainer as ToastifyContainer } from 'react-toastify'

interface ToastContainer {
  className?: string
}

export const ToastContainer: FC<ToastContainer> = ({ className }) => {
  return (
    <ToastifyContainer
      newestOnTop
      bodyClassName={() => ''}
      toastClassName={() =>
        'border border-accent mx-4 flex flex-col shadow-md bg-background mt-12 md:mt-2 rounded-xl overflow-hidden text-[color:var(--color)] pointer-events-auto'
      }
      className={className}
    />
  )
}
