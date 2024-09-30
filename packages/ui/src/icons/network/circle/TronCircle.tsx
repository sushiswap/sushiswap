import * as React from 'react'

import classNames from 'classnames'
import { IconComponent } from '../../../types'
import { TronNaked } from '../naked'

export const TronCircle: IconComponent = (props) => (
  <TronNaked
    {...props}
    className={classNames(props.className, '!text-white')}
    circle={<rect width={96} height={96} rx={48} fill="#ff060a" />}
  />
)
