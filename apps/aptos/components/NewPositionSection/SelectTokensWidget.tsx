import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Button } from '@sushiswap/ui'
import { Icon } from 'components/Icon'
import { Modal } from 'components/Modal/Modal'
import React, { FC } from 'react'
import { ContentBlock } from '../ContentBlock'
import { usePoolActions, usePoolState } from '../Pool/PoolProvider'
import TokenListDialog from '../TokenListDialog'
interface Props {
  handleSwap: () => void
}

export const SelectTokensWidget: FC<Props> = ({ handleSwap }) => {
  const { token0, token1 } = usePoolState()
  const { setToken0, setToken1 } = usePoolActions()
  return (
    <ContentBlock
      title={
        <>
          Which{' '}
          <span className="text-gray-900 dark:text-white">token pair</span>{' '}
          would you like to add liquidity to?
        </>
      }
    >
      <div className="flex gap-3">
        <TokenListDialog
          alteredSelected={token1}
          id={'liquidity-from-0'}
          selected={token0}
          handleSwap={handleSwap}
          handleChangeToken={setToken0}
        >
          <Modal.Trigger tag={'liquidity-from-0-token-selector-modal'}>
            {({ open }) => (
              <>
                <Button
                  onClick={open}
                  id="token0-select-button"
                  testId="token0-select-button"
                  size="default"
                  variant="outline"
                  color={!token0 ? 'blue' : 'default'}
                >
                  <div className="w-[28px] h-[28px] mr-0.5">
                    <Icon currency={token0} height={28} width={28} />
                  </div>
                  {token0.symbol}
                  <ChevronDownIcon
                    className="ml-1"
                    strokeWidth={3}
                    width={16}
                    height={16}
                  />
                </Button>
              </>
            )}
          </Modal.Trigger>
        </TokenListDialog>
        <TokenListDialog
          id={'liquidity-to-1'}
          selected={token1}
          alteredSelected={token0}
          handleChangeToken={setToken1}
          handleSwap={handleSwap}
        >
          <Modal.Trigger tag={'liquidity-to-1-token-selector-modal'}>
            {({ open }) => (
              <>
                <Button
                  onClick={open}
                  id="token1-select-button"
                  variant="outline"
                  size="default"
                  color={!token1 ? 'blue' : 'default'}
                  testdata-id="token1-select-button"
                >
                  <div className="w-[28px] h-[28px] mr-0.5">
                    <Icon currency={token1} height={28} width={28} />
                  </div>
                  {token1.symbol}

                  <ChevronDownIcon
                    className="ml-1"
                    strokeWidth={3}
                    width={16}
                    height={16}
                  />
                </Button>
              </>
            )}
          </Modal.Trigger>
        </TokenListDialog>
        <div
          style={{
            position: 'fixed',
            top: '1px',
            left: '1px',
            width: '1px',
            height: '0px',
            padding: '0px',
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0px, 0px, 0px, 0px)',
            whiteSpace: 'nowrap',
            borderWidth: '0px',
            display: 'none',
          }}
        />
      </div>
    </ContentBlock>
  )
}
