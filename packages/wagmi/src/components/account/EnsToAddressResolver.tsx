import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { ReactNode, useEffect } from 'react'
import { ChainId } from 'sushi/chain'
import { useEnsAddress } from 'wagmi'

export type Props = Parameters<typeof useEnsAddress<PublicWagmiConfig>>[0] & {
  children:
    | ReactNode
    | ReactNode[]
    | ((payload: ReturnType<typeof useEnsAddress>) => JSX.Element)
}

export const EnsToAddressResolver = ({
  children,
  chainId = ChainId.ETHEREUM,
  ...props
}: Props): JSX.Element => {
  const result = useEnsAddress({ ...props, chainId })

  // Custom onSuccess callback to send success data with resolved result
  useEffect(() => {
    if (result.data && props.query?.onSuccess) {
      props.query.onSuccess(result.data)
    }
  }, [props.query?.onSuccess, result.data])

  if (typeof children === 'function') {
    return children(result)
  }

  return <>{children}</>
}
