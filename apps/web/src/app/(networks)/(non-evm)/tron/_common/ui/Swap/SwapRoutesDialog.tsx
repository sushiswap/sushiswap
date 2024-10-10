import { Button } from '@sushiswap/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@sushiswap/ui'
import { useTokenInfo } from '~tron/_common/lib/hooks/useTokenInfo'
import { useSwapState } from '~tron/swap/swap-provider'
import { Icon } from '../General/Icon'

export const SwapRoutesDialog = () => {
  const { route } = useSwapState()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">View</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trade Route</DialogTitle>
          <DialogDescription>
            Optimized route to get the best price
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 min-h-[100px] items-center justify-center w-full">
          <div className="flex items-center w-full gap-2 justify-between border dark:border-slate-600 bg-white dark:bg-slate-700 rounded-full px-2 py-1">
            {route?.map((tokenAddress, idx) => (
              <SwapItem tokenAddress={tokenAddress} key={idx} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const SwapItem = ({ tokenAddress }: { tokenAddress: string }) => {
  const { data } = useTokenInfo({ tokenAddress })

  return (
    <div className="flex items-center gap-2">
      <Icon width={16} height={16} currency={data} />
      <span className="text-sm font-medium">{data?.symbol}</span>
    </div>
  )
}
