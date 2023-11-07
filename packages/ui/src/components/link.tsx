import Link from 'next/link'
import { AnchorHTMLAttributes, FC } from 'react'
import { classNames } from '../index'

const LinkInternal = Link
const LinkExternal: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  target = '_blank',
  rel = 'noopener noreferrer',
  ...props
}) => {
  return (
    <a
      {...props}
      target={target}
      rel={rel}
      className={classNames(
        props.className,
        'cursor-pointer text-blue hover:underline',
      )}
    />
  )
}

export { LinkExternal, LinkInternal }
