'use client'

import * as ToastPrimitives from '@radix-ui/react-toast'
import { type VariantProps, cva } from 'class-variance-authority'
import { X } from 'lucide-react'
import * as React from 'react'
import { classNames } from '../index'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={classNames(
      'fixed z-[51] bottom-6 right-6 !transition-[transform_.4s_ease,_bottom_.4s_ease] hover:translate-y-[-6px]',
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  'group max-w-[min(420px,calc(100vw-48px))] w-[420px] whitespace-nowrap group-hover:whitespace-pre mb-2 group pointer-events-auto relative flex items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-10 shadow-sm transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border border-accent bg-background text-foreground',
        destructive:
          'destructive group bg-red-500 border border-red text-white',
        success: 'border border-blue bg-blue text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const Toastnew = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={classNames(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toastnew.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={classNames(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <div className="h-full absolute flex items-center justify-center right-2 top-0 bottom-0">
    <ToastPrimitives.Close
      ref={ref}
      className={classNames(
        'h-[32px] hover:bg-secondary rounded-md p-2 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
        className,
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  </div>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, children, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={classNames(
      'h-full max-w-[356px] group-hover:w-full items-center gap-1.5 text-sm opacity-90 pr-10 flex-1',
      className,
    )}
    {...props}
  >
    <div className="truncate group-hover:whitespace-normal min-w-0">
      {children}
    </div>
  </ToastPrimitives.Description>
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastCaption = VariantProps<typeof toastVariants>

const ToastCaption = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> &
    ToastCaption
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={classNames(
      props.variant === 'default' ? 'text-muted-foreground' : 'text-white',
      'absolute top-2 left-0  text-[10px] uppercase tracking-wide font-semibold',
      className,
    )}
    {...props}
  />
))
ToastCaption.displayName = 'ToastCaption'

type ToastProps = React.ComponentPropsWithoutRef<typeof Toastnew>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toastnew,
  ToastDescription,
  ToastCaption,
  ToastClose,
  ToastAction,
}
