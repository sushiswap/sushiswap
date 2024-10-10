import { IconComponent } from '../types'

export const XIcon: IconComponent = (props) => {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m2.5 17.5 6.29-6.29m0 0L2.5 2.5h4.167l4.543 6.29m-2.42 2.42 4.543 6.29H17.5l-6.29-8.71M17.5 2.5l-6.29 6.29"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
