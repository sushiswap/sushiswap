import React from 'react'

export const RiseIcon = (props: React.ComponentProps<'svg'>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 30 30"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <radialGradient
        id="0"
        gradientTransform="translate(-0.2 -0.8) scale(2, 2)"
      >
        <stop offset="40%" stopColor="#22e4e5" />
        <stop offset="100%" stopColor="#071ee6" />
      </radialGradient>
      <clipPath id="a">
        <path d="m0 0h90.9091v30h-90.9091z" />
      </clipPath>
      <g clipPath="url(#a)" fill="url(#0)">
        <path d="m13.6333 2.45508c-7.53005 0-13.6333 6.16695-13.6333 13.77252 0 7.6055 6.10325 13.7724 13.6333 13.7724 7.53 0 13.6332-6.1669 13.6332-13.7724 0-7.60557-6.1032-13.77252-13.6332-13.77252zm7.7315 13.09212c-.065.3757-.4206.6804-.7925.6804h-6.939l-.8115 4.6532c-.0649.3757-.4206.6803-.7925.6803h-6.26549c-.37191 0-.62074-.3046-.55448-.6803l.69377-3.9729c.06491-.3757.42059-.6803.79249-.6803h6.93901l.8114-4.6533c.0649-.3757.4206-.6803.7925-.6803h6.2656c.3719 0 .6207.3046.5544.6803z" />
      </g>
    </svg>
  )
}
