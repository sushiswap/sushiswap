import { Button, Card, Message } from '@sushiswap/ui'
import { useRemoveLiqDispatch, useRemoveLiqState } from './pool-remove-provider'

const PercentageOptions = [25, 50, 75, 100]

export const RemoveInput = () => {
  const { percentage, lpBalance } = useRemoveLiqState()
  const { setPercentage } = useRemoveLiqDispatch()

  const noLpToken = Number(lpBalance) <= 0

  return (
    <>
      {noLpToken ? (
        <Message variant="warning" size="sm" className="mb-4">
          No LP tokens found.
        </Message>
      ) : null}
      <Card variant="outline" className="p-6" disabled={noLpToken}>
        <div className="flex w-full items-center justify-between pb-2">
          <div className="text-gray-900 dark:text-slate-50 text-3xl font-medium">{`${percentage}%`}</div>
          <div className="flex items-center gap-1">
            {PercentageOptions.map((option) => (
              <Button
                key={option}
                variant="secondary"
                onClick={() => {
                  if (noLpToken) return
                  setPercentage(option)
                }}
              >
                {option === 100 ? 'MAX' : `${option}%`}
              </Button>
            ))}
          </div>
        </div>
        <input
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          type="range"
          min="1"
          max="100"
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
          disabled={noLpToken}
        />
      </Card>
    </>
  )
}
