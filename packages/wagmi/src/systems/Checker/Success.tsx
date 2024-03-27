'use client'

import { FC, ReactNode, useEffect } from 'react'

import { watchAccount } from '@wagmi/core'
import { useConfig } from 'wagmi'
import { useApprovedActions } from './Provider'

interface SuccessProps {
  children: ReactNode
  tag: string
}
// If this gets mounted it sets checker approved to true
const Success: FC<SuccessProps> = ({ children, tag }) => {
  const { setApproved } = useApprovedActions(tag)
  const config = useConfig()

  useEffect(() => {
    setApproved(true)
    return () => {
      setApproved(false)
    }
  }, [setApproved])

  useEffect(() => {
    const unwatchAccountListener = watchAccount(config, {
      onChange: () => {
        setApproved(true)
      },
    })

    return () => {
      unwatchAccountListener()
    }
  }, [setApproved, config])

  return <>{children}</>
}

export { Success, type SuccessProps }
