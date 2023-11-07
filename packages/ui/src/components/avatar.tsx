'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import Image from 'next/image'
import * as React from 'react'

import classNames from 'classnames'
import { cloudinaryImageLoader } from '../cloudinary'

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={classNames(
      'relative inline-block h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

interface AvatarImageProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  loader: typeof cloudinaryImageLoader
  src: string
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, loader, width, src }, ref) => {
  const _width = Number(width) ?? 40

  return (
    <AvatarPrimitive.Image
      src={loader({ src, width: _width })}
      asChild
      ref={ref}
      className={classNames('aspect-square h-full w-full', className)}
    >
      <Image
        loader={loader}
        alt="avatar"
        src={src}
        width={_width}
        height={_width}
      />
    </AvatarPrimitive.Image>
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={classNames(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className,
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarFallback, AvatarImage }
