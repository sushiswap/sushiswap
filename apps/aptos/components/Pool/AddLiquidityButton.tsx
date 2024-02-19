import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Button } from '@sushiswap/ui'
import { Modal } from 'components/Modal/Modal'
import WalletSelector from '../WalletSelector'
import { usePoolState } from './PoolProvider'

interface Props {
  buttonError: string
  token1Value: string
}

export const AddLiquidityButton = ({ buttonError, token1Value }: Props) => {
  const { connected } = useWallet()
  const { isPriceFetching, amount0, amount1 } = usePoolState()
  return (
    <Modal.Trigger tag="add-liquidity">
      {({ open }) => (
        <>
          {connected ? (
            <Button
              fullWidth
              size="xl"
              type="button"
              disabled={Boolean(
                !!buttonError ||
                  isPriceFetching ||
                  buttonError ||
                  Number(amount0) <= 0 ||
                  Number(amount1) <= 0,
              )}
              onClick={() => {
                token1Value ? open() : {}
              }}
            >
              {buttonError ? (
                'Insufficient Balance'
              ) : Number(amount0) > 0 && Number(amount1) > 0 ? (
                <>Add Liquidity</>
              ) : (
                <>Enter Amount</>
              )}
            </Button>
          ) : (
            <WalletSelector />
          )}
        </>
      )}
    </Modal.Trigger>
  )
}
