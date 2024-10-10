import * as React from 'react'

import { NakedNetworkIconComponent } from '../../../types'

export const ZKLinkNaked: NakedNetworkIconComponent = ({
  circle,
  ...props
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {circle ? circle : <path fill="#000" d="M0 0h64v64H0z" />}
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="m32.6 7.53-.752-.436-.752.435-11.508 6.662-.748.433V27.95L8.073 34.184l-.749.433V49.67l.749.434 11.508 6.662.751.435.752-.435 10.756-6.227 10.756 6.227.752.435.751-.435 11.508-6.662.748-.434V34.617l-.748-.433-10.752-6.224V14.624l-.748-.433zm-10.76 8.824 10.008-5.793 10.007 5.793v11.594l-7.84 4.538a3.3 3.3 0 0 0-2.144-.788c-.827 0-1.583.303-2.164.805l-7.867-4.555zm6.736 18.97-8.244-4.772-10.008 5.794V47.94l10.008 5.793 10.006-5.792v-9.998a3.31 3.31 0 0 1-1.762-2.618m4.764 2.651v9.965l10.008 5.793 10.007-5.793V36.346l-10.002-5.79-8.184 4.738a3.31 3.31 0 0 1-1.83 2.682"
      fill="#03D498"
    />
    <path
      clip-rule="evenodd"
      d="m31.848 22.17 11.507 6.661v13.324l-11.507 6.662-11.508-6.662V28.831z"
      stroke="#fff"
      stroke-width="3"
      stroke-linecap="round"
    />
  </svg>
)
