'use client'
import { MinimumReceive } from './MinimumReceive'
import { RemoveButton } from './RemoveButton'
import { RemoveInput } from './RemoveInput'

export const RemoveLiquidity = () => {
  return (
    <div className="flex flex-col gap-4">
      <RemoveInput />
      <MinimumReceive />
      <RemoveButton variant="outline" fullWidth />
    </div>
  )
}
