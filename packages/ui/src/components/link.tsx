'use client'

import { InterfaceEventName, sendAnalyticsEvent } from '@sushiswap/telemetry'
import Link from 'next/link'
import { AnchorHTMLAttributes, FC } from 'react'

const LinkInternal = Link
const LinkExternal: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  target = '_blank',
  rel = 'noopener noreferrer',
  ...props
}) => {
  return (
    <button
      onClick={() =>
        sendAnalyticsEvent(InterfaceEventName.EXTERNAL_LINK_CLICK, {
          label: props.href,
        })
      }
      type="button"
    >
      <a
        {...props}
        target={target}
        rel={rel}
        className="cursor-pointer text-blue hover:underline"
      />
    </button>
  )
}

export { LinkExternal, LinkInternal }
