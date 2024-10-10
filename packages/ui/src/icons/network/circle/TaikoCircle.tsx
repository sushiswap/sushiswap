import * as React from 'react'

import { IconComponent } from '../../../types'
import { TaikoNaked } from '../naked/TaikoNaked'

export const TaikoCircle: IconComponent = (props) => (
  <TaikoNaked
    {...props}
    circle={<circle cx="125" cy="125" r="125" fill="#eb1b9b" />}
  />
)
