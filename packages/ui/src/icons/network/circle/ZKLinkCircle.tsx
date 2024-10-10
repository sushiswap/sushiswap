import * as React from 'react'

import { IconComponent } from '../../../types'
import { ZKLinkNaked } from '../naked/ZKLinkNaked'

export const ZKLinkCircle: IconComponent = (props) => (
  <ZKLinkNaked
    {...props}
    circle={<rect width="64" height="64" fill="#000" rx="64" />}
  />
)
