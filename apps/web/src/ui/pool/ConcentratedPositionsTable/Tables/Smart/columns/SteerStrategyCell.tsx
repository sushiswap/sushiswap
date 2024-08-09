import React, { FC } from 'react'
import { SteerAccountPositionVault } from 'src/lib/wagmi/hooks/steer/useSteerAccountPositionsExtended'
import { SteerStrategyConfig } from '../../../../Steer/constants'

export const SteerStrategyCell: FC<{ vault: SteerAccountPositionVault }> = ({
  vault,
}) => {
  return <div>{SteerStrategyConfig[vault.strategy].name}</div>
}
