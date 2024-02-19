import { Button, LinkInternal } from '@sushiswap/ui'
import { useParams } from 'next/navigation'
import { FC } from 'react'

interface PoolButtonsProps {
  isFarm: boolean
  token0: string
  token1: string
}

export const PoolButtons: FC<PoolButtonsProps> = ({
  isFarm,
  token0,
  token1,
}) => {
  const router = useParams()
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex gap-2">
        <LinkInternal
          href={`/pool/add?token0=${token0}&token1=${token1}`}
          passHref={true}
        >
          <Button size="lg" fullWidth>
            Deposit
          </Button>
        </LinkInternal>
      </div>
      <LinkInternal href={'/swap'} passHref={true}>
        <Button className="col-span-2" size="lg" color="default">
          Trade
        </Button>
      </LinkInternal>
      {isFarm && (
        <LinkInternal href={`/pool/${decodeURIComponent(router?.id)}/stake`}>
          <Button className="col-span-2" size="lg" color="default">
            Stake Liquidity
          </Button>
        </LinkInternal>
      )}
    </div>
  )
}
