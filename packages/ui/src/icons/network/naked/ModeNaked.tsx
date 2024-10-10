import React from 'react'

import { NakedNetworkIconComponent } from '../../../types'

export const ModeNaked: NakedNetworkIconComponent = ({ circle, ...props }) => {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {circle ? circle : <rect width="100%" height="100%" fill="#DFFE00" />}
      <path
        d="M203.881 195.4H174.232V128.11L186.104 89.7348L177.692 86.7415L139.215 195.4H116.666L78.1884 86.7415L69.7771 89.7348L81.6484 128.11V195.4H52V60.4H96.1444L123.526 137.688V160.378H132.474V137.688L159.856 60.4H204V195.4H203.881Z"
        fill="black"
      />
    </svg>
  )
}
