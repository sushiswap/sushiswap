'use client'

import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@sushiswap/ui'
import { Button, ButtonProps } from '@sushiswap/ui'
import { FC, ReactElement, ReactNode } from 'react'
import { ChainId, chainName } from 'sushi/chain'
import { useAccount, useSwitchChain } from 'wagmi'

interface NetworkProps extends ButtonProps {
  chainId: ChainId | undefined
  hoverCardContent?: ReactNode | undefined
}

const Network: FC<NetworkProps> = ({
  chainId,
  fullWidth = true,
  size = 'xl',
  children,
  hoverCardContent,
  ...rest
}): ReactElement<any, any> | null => {
  const { chain } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  if (!chainId) return null

  if (chain?.id !== chainId) {
    return !hoverCardContent ? (
      <Button
        fullWidth={fullWidth}
        size={size}
        onClick={async () => {
          await switchChainAsync?.({ chainId })
        }}
        testId={`switch-network-${chainId}`}
        {...rest}
      >
        Switch to {chainName[chainId]}
      </Button>
    ) : (
      <HoverCard openDelay={0} closeDelay={0}>
        <Button
          fullWidth={fullWidth}
          size={size}
          onClick={async () => await switchChainAsync?.({ chainId })}
          testId={`switch-network-${chainId}`}
          {...rest}
        >
          Switch to {chainName[chainId]}
          <HoverCardTrigger>
            <InformationCircleIcon width={16} height={16} />
          </HoverCardTrigger>
        </Button>
        <HoverCardContent className="max-w-[360px]">
          {hoverCardContent}
        </HoverCardContent>
      </HoverCard>
    )
  }

  return <>{children}</>
}

export { Network, type NetworkProps }
