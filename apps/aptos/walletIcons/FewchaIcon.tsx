import React from 'react'

export const FewchaIcon = (props: React.ComponentProps<'svg'>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 26 26"
      fill="none"
      {...props}
    >
      <linearGradient
        xmlns="http://www.w3.org/2000/svg"
        id="0"
        x1="0.5"
        y1="0"
        x2="0.5"
        y2="1"
      >
        <stop offset="0%" stopColor="#47a2f7" />
        <stop offset="25%" stopColor="#2a90f5" />
        <stop offset="50%" stopColor="#1e7cf0" />
        <stop offset="100%" stopColor="#0148fe" />
      </linearGradient>
      <g fill="url(#0)">
        <path d="M18.3001 12.9945H6.10352C6.10352 9.64399 8.84582 6.89062 12.2074 6.89062C15.5689 6.89062 18.3112 9.63293 18.3112 12.9945H18.3001Z" />
        <path d="M12.1966 0.797852C5.4625 0.797852 0 6.26035 0 12.9945C0 19.7286 5.4625 25.1911 12.1966 25.1911C18.9308 25.1911 24.3933 19.7286 24.3933 12.9945C24.3933 6.26035 18.9418 0.797852 12.1966 0.797852ZM12.1966 22.1503C7.16538 22.1503 3.04087 18.0368 3.04087 12.9945C3.04087 7.95218 7.16538 3.84977 12.1966 3.84977C17.2279 3.84977 21.3524 7.96324 21.3524 13.0055C21.3524 18.0479 17.2389 22.1613 12.1966 22.1613V22.1503Z" />
      </g>
    </svg>
  )
}
