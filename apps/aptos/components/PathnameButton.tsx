'use client'

import { Button, ButtonProps } from '@sushiswap/ui'
import { usePathname } from 'next/navigation'
import { forwardRef } from 'react'

interface PathnameButton extends Omit<ButtonProps, 'variant'> {
  pathname: string
}

const PathnameButton = forwardRef<HTMLButtonElement, PathnameButton>(
  ({ pathname, ...props }, ref) => {
    const _pathname = usePathname()
    return (
      <Button
        {...props}
        ref={ref}
        variant={
          _pathname === pathname || _pathname === pathname.replace('%3A', ':')
            ? 'secondary'
            : 'ghost'
        }
      />
    )
  },
)

PathnameButton.displayName = 'PathnameButton'

export { PathnameButton }
