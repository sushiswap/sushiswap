'use client'

import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { IconButton, IconButtonProps } from '@sushiswap/ui'
import { useRouter } from 'next/navigation'
import { forwardRef } from 'react'

const BackButton = forwardRef<HTMLButtonElement, Omit<IconButtonProps, 'icon'>>(
  ({ ...props }, ref) => {
    const { back } = useRouter()
    return (
      <IconButton
        onClick={back}
        {...props}
        name={props.name}
        icon={ChevronLeftIcon}
        ref={ref}
      />
    )
  },
)

BackButton.displayName = 'BackButton'

export { BackButton }
