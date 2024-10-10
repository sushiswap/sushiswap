import { Button, ButtonProps } from '@sushiswap/ui'
import React, { FC } from 'react'

interface GuardProps extends ButtonProps {
  guardWhen: boolean
  guardText: string
}

const Guard: FC<GuardProps> = ({
  guardWhen,
  guardText,
  children,
  fullWidth = true,
  size = 'xl',
  ...props
}) => {
  if (guardWhen) {
    return (
      <Button size={size} fullWidth={fullWidth} disabled {...props}>
        {guardText}
      </Button>
    )
  }

  return <>{children}</>
}

export { Guard, type GuardProps }
