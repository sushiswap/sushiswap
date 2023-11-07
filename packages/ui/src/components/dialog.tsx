'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'
import {
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
import { Chain, ChainId } from 'sushi/chain'

import {
  ArrowTopRightOnSquareIcon,
  ArrowUpIcon,
} from '@heroicons/react/20/solid'
import {
  Button,
  Dots,
  IconButton,
  LinkExternal,
  LinkInternal,
  Loader,
  classNames,
} from '../index'
import { CheckMarkIcon } from './icons/CheckmarkIcon'
import { FailedMarkIcon } from './icons/FailedMarkIcon'

const dialogVariants = cva(
  'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  {
    variants: {
      variant: {
        default:
          'rounded-b-none md:rounded-b-2xl bottom-0 md:bottom-[unset] fixed left-[50%] md:top-[50%] z-[52] grid w-full max-w-lg translate-x-[-50%] md:translate-y-[-50%] gap-4 bg-gray-100 dark:bg-slate-800 p-6 shadow-lg rounded-2xl md:w-full data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-bottom-[48%] md:data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-bottom-[48%] md:data-[state=open]:slide-in-from-top-[48%]',
        opaque: 'px-4 fixed z-[52] top-4 grid w-full max-w-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const dialogOverlayVariants = cva(
  'fixed inset-0 z-[52] transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in',
  {
    variants: {
      variant: {
        default: 'bg-black/10 backdrop-blur-sm',
        opaque: 'bg-gray-100 dark:bg-slate-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const dialogCloseVariants = cva('', {
  variants: {
    variant: {
      default: 'absolute top-6 right-6',
      opaque: 'hidden',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const DialogPortal = ({
  className,
  children,
  ...props
}: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal className={classNames(className)} {...props}>
    <div className="fixed inset-0 z-[52] flex items-start justify-center sm:items-center">
      {children}
    </div>
  </DialogPrimitive.Portal>
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

interface DialogOverlay
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
    VariantProps<typeof dialogOverlayVariants> {}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlay
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={dialogOverlayVariants({ variant, className })}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogVariants> {
  hideClose?: boolean
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    { className, hideClose: _hideClose = false, variant, children, ...props },
    ref,
  ) => (
    <DialogPortal>
      <DialogOverlay variant={variant} />
      <DialogPrimitive.Content
        ref={ref}
        className={dialogVariants({ variant, className })}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          asChild
          className={dialogCloseVariants({ variant })}
        >
          <IconButton icon={XMarkIcon} name="Close" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  ),
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNames(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNames(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={classNames(
      'text-lg font-semibold leading-none tracking-tight mr-[64px]',
      className,
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={classNames('text-sm text-muted-foreground mr-[64px]', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

interface DialogReviewProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>,
    'children' | 'open'
  > {
  children: ({
    confirm,
    close,
  }: { confirm(): void; close(): void }) => ReactNode
}

const DialogReview: FC<DialogReviewProps> = ({ children, ...props }) => {
  const { confirm, open, setOpen } = useDialog(DialogType.Review)

  const close = useCallback(() => setOpen(false), [setOpen])

  return (
    <Dialog {...props} open={open} onOpenChange={setOpen}>
      {children({ confirm, close })}
    </Dialog>
  )
}
DialogReview.displayName = 'DialogReview'

interface DialogCustomProps {
  children: ReactNode
  dialogType: DialogType
}

const DialogCustom: FC<DialogCustomProps> = ({ children, ...props }) => {
  const { open, setOpen } = useDialog(DialogType.Confirm)
  return (
    <Dialog {...props} open={open} onOpenChange={setOpen}>
      {children}
    </Dialog>
  )
}
DialogCustom.displayName = 'DialogCustom'

interface DialogSuccessProps extends DialogContentProps {
  chainId: ChainId
  hash: string | undefined
  testId: string
  summary: ReactNode
  buttonText: ReactNode
  onClose?(): void
}

const DialogSuccess: FC<DialogSuccessProps> = ({
  chainId,
  hash,
  testId,
  buttonText = 'Close',
  summary,
  onClose,
  ...props
}) => {
  const { open, setOpen } = useDialog(DialogType.Confirm)

  // Call onClose handler with delayed timeout to allow for animation to finish
  const onOpenChangeHandler = useCallback(
    (open: boolean) => {
      setOpen(false)

      if (!open && onClose) {
        setTimeout(() => {
          onClose()
        }, 200)
      }
    },
    [setOpen, onClose],
  )

  return (
    <Dialog {...props} open={open} onOpenChange={onOpenChangeHandler}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction sent!</DialogTitle>
          <DialogDescription className="font-medium">
            {summary}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 justify-center items-center py-4">
          <div className="p-8 rounded-full border-[3px] border-green">
            <ArrowUpIcon width={40} height={40} className="text-green" />
          </div>
        </div>
        <DialogFooter className="flex !flex-col !space-x-0 gap-4">
          <LinkExternal
            href={chainId && hash ? Chain.from(chainId)?.getTxUrl(hash) : ''}
            className="text-unset"
          >
            <Button
              variant="outline"
              testId={testId}
              fullWidth
              size="xl"
              iconPosition="end"
              icon={ArrowTopRightOnSquareIcon}
            >
              View on Explorer
            </Button>
          </LinkExternal>
          <DialogClose asChild>
            <Button testId={testId} fullWidth size="xl">
              {buttonText}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
DialogSuccess.displayName = 'DialogSuccess'

interface DialogConfirmProps extends DialogContentProps {
  chainId: ChainId
  testId: string
  successMessage: ReactNode
  buttonLink?: string
  buttonText?: string
  txHash: string | undefined
  status: 'idle' | 'loading' | 'success' | 'error'
}

const DialogConfirm: FC<DialogConfirmProps> = ({
  chainId,
  testId,
  successMessage,
  buttonText = 'Close',
  buttonLink,
  status,
  txHash,
  ...props
}) => {
  const { open, setOpen } = useDialog(DialogType.Confirm)

  return (
    <Dialog {...props} open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {status === 'loading' ? (
              <Dots>Confirming</Dots>
            ) : status === 'success' ? (
              'Success!'
            ) : (
              'Oops!'
            )}
          </DialogTitle>
          <DialogDescription className="font-medium">
            {status === 'loading' ? (
              <>
                Waiting for your{' '}
                <a
                  target="_blank"
                  href={txHash ? Chain.from(chainId)?.getTxUrl(txHash) : ''}
                  className="cursor-pointer text-blue hover:underline"
                  rel="noreferrer"
                >
                  transaction
                </a>{' '}
                to be confirmed on the blockchain.
              </>
            ) : status === 'success' ? (
              <a
                target="_blank"
                href={txHash ? Chain.from(chainId)?.getTxUrl(txHash) : ''}
                className="cursor-pointer text-blue hover:underline"
                rel="noreferrer"
              >
                {successMessage}
              </a>
            ) : (
              <a
                target="_blank"
                href={txHash ? Chain.from(chainId)?.getTxUrl(txHash) : ''}
                className="cursor-pointer text-blue hover:underline"
                rel="noreferrer"
              >
                Something went wrong...
              </a>
            )}
          </DialogDescription>
          <div className="py-6 flex justify-center">
            {status === 'loading' ? (
              <Loader size={132} strokeWidth={1} className="!text-blue" />
            ) : status === 'success' ? (
              <CheckMarkIcon width={132} height={132} />
            ) : (
              <FailedMarkIcon width={132} height={132} />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                testId={testId}
                asChild={!!buttonLink}
                fullWidth
                size="xl"
              >
                {buttonLink ? (
                  <LinkInternal href={buttonLink}>{buttonText}</LinkInternal>
                ) : (
                  <>{buttonText}</>
                )}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
DialogConfirm.displayName = 'DialogConfirm'

enum DialogType {
  Review = 0,
  Confirm = 1,
}

interface DialogContext {
  state: Record<DialogType, boolean>

  confirm(): void

  setState: Dispatch<SetStateAction<Record<DialogType, boolean>>>
}

const DialogContext = createContext<DialogContext | undefined>(undefined)

interface DialogProviderProps {
  children: ReactNode
}

const DialogProvider: FC<DialogProviderProps> = ({ children }) => {
  const [state, setState] = useState<Record<DialogType, boolean>>({
    [DialogType.Review]: false,
    [DialogType.Confirm]: false,
  })

  const confirm = useCallback(() => {
    setState({
      [DialogType.Review]: false,
      [DialogType.Confirm]: true,
    })
  }, [])

  return (
    <DialogContext.Provider value={{ state, confirm, setState }}>
      {children}
    </DialogContext.Provider>
  )
}

type UseDialog<T> = T extends DialogType.Review
  ? {
      open: boolean
      setOpen(open: boolean): void
      confirm(): void
    }
  : {
      open: boolean
      setOpen(open: boolean): void
    }

const useDialog = <T extends DialogType>(type: T): UseDialog<T> => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('Hook can only be used inside Modal Context')
  }

  const { state, setState, confirm } = context

  return useMemo(() => {
    if (type === DialogType.Review) {
      return {
        open: Boolean(state[type]),
        setOpen: (val) =>
          setState((prev) => ({ ...prev, [DialogType.Review]: val })),
        confirm,
      } as UseDialog<T>
    } else {
      return {
        open: Boolean(state[type]),
        setOpen: (val) =>
          setState((prev) => ({ ...prev, [DialogType.Confirm]: val })),
      } as UseDialog<T>
    }
  }, [state, setState, confirm, type])
}

export {
  Dialog,
  DialogClose,
  DialogConfirm,
  DialogContent,
  DialogCustom,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSuccess,
  DialogOverlay,
  DialogPrimitive,
  DialogProvider,
  DialogReview,
  DialogTitle,
  DialogTrigger,
  DialogType,
  useDialog,
}
