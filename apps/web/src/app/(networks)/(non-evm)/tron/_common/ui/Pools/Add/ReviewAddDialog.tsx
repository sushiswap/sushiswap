import { ButtonProps, List, SkeletonBox } from '@sushiswap/ui'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@sushiswap/ui'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { useRef } from 'react'
import { formatUSD } from 'sushi/format'
import { useStablePrice } from '~tron/_common/lib/hooks/useStablePrice'
import { formatUnits } from '~tron/_common/lib/utils/formatters'
import { Icon } from '../../General/Icon'
import { WalletConnector } from '../../WalletConnector/WalletConnector'
import { usePoolState } from '../pool-provider'
import { AddButton } from './AddButton'
import { ReviewAddDialogTrigger } from './ReviewAddDialogTrigger'

export const ReviewAddDialog = (props: ButtonProps) => {
  const { token0, token1, amountInToken0, amountInToken1 } = usePoolState()
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const { address, connected } = useWallet()
  const isConnected = address && connected
  const { data: token0Price, isLoading: isLoadingToken0Price } = useStablePrice(
    { token: token0 },
  )
  const { data: token1Price, isLoading: isLoadingToken1Price } = useStablePrice(
    { token: token1 },
  )

  const closeModal = () => {
    closeBtnRef?.current?.click()
  }

  return (
    <Dialog>
      {isConnected ? (
        <ReviewAddDialogTrigger {...props} />
      ) : (
        <WalletConnector {...props} />
      )}
      <DialogContent>
        <DialogClose ref={closeBtnRef} />
        <DialogHeader>
          <DialogTitle>Add liquidity</DialogTitle>
          <DialogDescription>
            Please review your entered details.
          </DialogDescription>
        </DialogHeader>
        <div className="max-w-[504px] mx-auto w-full">
          <div className="flex flex-col gap-4 w-full">
            <List className="w-full">
              <List.Control>
                <List.KeyValue title={token0?.symbol}>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <Icon currency={token0} width={16} height={16} />
                      {/* show max 12 decimals so nothing is cut off */}
                      <div>{formatUnits(amountInToken0, 0, 12)}</div>{' '}
                      <div>{token0?.symbol}</div>
                    </div>
                    {isLoadingToken0Price ? (
                      <SkeletonBox className="h-3 w-[40px] rounded-sm" />
                    ) : (
                      <div className="text-[12px] opacity-60">
                        {formatUSD(
                          Number(token0Price) * Number(amountInToken0),
                        )}
                      </div>
                    )}
                  </div>
                </List.KeyValue>
                <List.KeyValue title={token1?.symbol}>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <Icon currency={token1} width={16} height={16} />
                      {/* show max 12 decimals so nothing is cut off */}
                      <div>{formatUnits(amountInToken1, 0, 12)}</div>{' '}
                      <div>{token1?.symbol}</div>
                    </div>
                    {isLoadingToken1Price ? (
                      <SkeletonBox className="h-3 w-[40px] rounded-sm" />
                    ) : (
                      <div className="text-[12px] opacity-60">
                        {formatUSD(
                          Number(token1Price) * Number(amountInToken1),
                        )}
                      </div>
                    )}
                  </div>
                </List.KeyValue>
              </List.Control>
            </List>
            <AddButton closeModal={closeModal} {...props} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
