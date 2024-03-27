'use client'

import { useLocalStorage } from '@sushiswap/hooks'
import { useCallback, useState } from 'react'
import { Address } from 'viem'
import {
  useConnect as useWagmiConnect,
  useDisconnect as useWagmiDisconnect,
} from 'wagmi'

export const useConnect = (props?: Parameters<typeof useWagmiConnect>[0]) => {
  const [_, setSanctionedAddress] = useLocalStorage('sanctionedAddress', false)

  const [pending, setPending] = useState(false)

  const { disconnect } = useWagmiDisconnect()
  const { connectAsync, ...rest } = useWagmiConnect(props)

  const onSuccess = useCallback(
    async (account: Address) => {
      if (process.env.NODE_ENV !== 'production') return

      const resp = await fetch(
        'https://api.trmlabs.com/public/v1/sanctions/screening',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Authorization: 'Basic ' + Buffer.from('<username>:<password>').toString('base64')
          },
          body: JSON.stringify([{ address: account }]),
        },
      )
        .then((response) => response.json())
        .then(
          (
            data: {
              address: string
              isSanctioned: boolean
            }[],
          ) => data[0],
        )

      if (resp.isSanctioned) {
        setSanctionedAddress(true)
        disconnect()
      }
    },
    [setSanctionedAddress, disconnect],
  )

  const _connectAsync = async (...args: Parameters<typeof connectAsync>) => {
    let result

    try {
      setPending(true)
      result = await connectAsync(...args)
      await onSuccess(result.accounts[0])
      return result
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      setPending(false)
    }
  }

  return {
    ...rest,
    connect: connectAsync,
    connectAsync: _connectAsync,
    pending,
  }
}
