'use client'

import { TextField, TextFieldProps } from '@sushiswap/ui'
import { ForwardedRef, forwardRef, useEffect } from 'react'
import { ChainId } from 'sushi/chain'
import { useEnsAddress } from 'wagmi'

function Component(
  props: Omit<TextFieldProps<'text'>, 'type'>,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const { data } = useEnsAddress({
    name: `${props.value}`,
    chainId: ChainId.ETHEREUM,
    query: {
      enabled: Boolean(
        props.value &&
          typeof props.value === 'string' &&
          props.value.length > 2,
      ),
    },
  })

  useEffect(() => {
    if (typeof data === 'string' && props.onValueChange) {
      props.onValueChange(data)
    }
  }, [data, props.onValueChange])

  // useEnsResolver({
  //   name: `${props.value}`,
  //   chainId: ChainId.ETHEREUM,
  //   enabled: Boolean(props.value && typeof props.value === 'string' && props.value.length > 2),
  //   onSuccess(data) {
  //     console.log(data)

  //     if (props.onValueChange && data) {
  //       props.onValueChange(data)
  //     }
  //   },
  // })

  return <TextField {...props} type="text" ref={ref} />
}

export const EnsInput = forwardRef(Component)
