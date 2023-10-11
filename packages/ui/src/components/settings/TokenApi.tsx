'use client'

import React, { FC } from 'react'
import { useLocalStorage } from '@sushiswap/hooks'
import { Label, Switch, typographyVariants } from '../..'

export const TokenApi: FC = () => {
  const [tokenApi, setTokenApi] = useLocalStorage('tokenApi', true)

  return (
    <div className="p-4 rounded-lg">
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-2">
          <Label>Token API</Label>
          <span
            className={typographyVariants({
              variant: 'muted',
              className: 'text-sm',
            })}
          >
            Use the Token API to fetch tokens.
          </span>
        </div>
        <Switch
          checked={tokenApi}
          onCheckedChange={(checked) => setTokenApi(checked)}
        />
      </div>
    </div>
  )
}
