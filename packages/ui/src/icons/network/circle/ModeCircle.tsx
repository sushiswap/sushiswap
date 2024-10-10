import * as React from 'react'

import { IconComponent } from '../../../types'
import { ModeNaked } from '../naked/ModeNaked'

export const ModeCircle: IconComponent = (props) => (
  <ModeNaked
    {...props}
    circle={<circle cx="128" cy="128" r="128" fill="#DFFE00" />}
  />
)
