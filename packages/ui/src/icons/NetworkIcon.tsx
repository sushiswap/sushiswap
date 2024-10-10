import React, { FC, useMemo } from 'react'

import { IconProps } from '../types'
import { NETWORK_CIRCLE_ICON, NETWORK_NAKED_ICON } from './network'

interface Props extends IconProps {
  type?: 'naked' | 'circle'
  chainId: number | string
}

export const NetworkIcon: FC<Props> = ({
  type = 'circle',
  chainId,
  ...props
}) => {
  const Icon = useMemo(() => {
    if (type === 'naked') {
      return NETWORK_NAKED_ICON[chainId]
    }

    return NETWORK_CIRCLE_ICON[chainId]
  }, [chainId, type])

  if (Icon) return <Icon {...props} />
  return <></>
}
