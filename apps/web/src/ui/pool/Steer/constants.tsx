import { SteerStrategy } from '@sushiswap/steer-sdk'

interface SteerStrategyConfig {
  name: string
  description: string
}

export const SteerStrategyConfig: Record<SteerStrategy, SteerStrategyConfig> = {
  [SteerStrategy.SuperWide]: {
    name: 'Super Wide Pool',
    description:
      'This strategy is designed to give an extremely low risk profile similar to that of constant product style AMMs while enabling deeper liquidity. It uses incredibly wide positions that are highly unlikely to go out of range or even have a major shift in token holding ratio.',
  },
  [SteerStrategy.ClassicRebalance]: {
    name: 'Classic Rebalance Pool',
    description:
      'This strategy makes a position of a fixed size centered around the current price. This position is maintained until the current price leaves the position range. The position then rebalances and makes a new position centered around the new current price.',
  },
  [SteerStrategy.DeltaNeutralStables]: {
    name: 'Delta Neutral Pool',
    description:
      'Uses Simple Moving Average and a predefined multiplier to construct a price range.',
  },
  [SteerStrategy.StableExpansion]: {
    name: 'Stable Expansion Pool',
    description: '',
  },
  [SteerStrategy.ElasticExpansion]: {
    name: 'Elastic Expansion Pool',
    description:
      'This strategy uses a technique called Bollinger bands to create a flexible pool of funds for liquidity provision. It automatically adjusts to changes in market conditions, such as price swings and fluctuations, to optimize the placement of funds, fees earned, and capital efficiency.',
  },
  [SteerStrategy.HighLowChannel]: {
    name: 'High Low Channel Pool',
    description:
      'The Donchian Channel is a technical indicator used to measure the highest high and lowest low over a specified period, and it creates an upper and lower band accordingly. The range multiplier is also used to adjust the bands based on market volatility.',
  },
  [SteerStrategy.MovingVolatilityChannelMedium]: {
    name: 'Moving Volatility Pool',
    description:
      'This strategy uses recent trading data to form a Keltner Channel that sets the range to place optimal liquidity for a given period of time. The Keltner Channel is a technical indicator that measures volatility using upper and lower bands, and an exponential moving average. These bands adjust based on market volatility.',
  },
  [SteerStrategy.StaticStable]: {
    name: 'Stable Pool',
    description:
      "This strategy is set based on the token's decimal precision and the typical offset and variance from the ideal peg. These positions are static, meaning low gas fees and reduced price volatility.",
  },
  [SteerStrategy.BollingerAlgo]: {
    name: 'Bollinger Bands Pool',
    description:
      'This strategy uses a technique called Bollinger bands to create a flexible pool of funds for liquidity provision. It automatically adjusts to changes in market conditions, such as price swings and fluctuations, to optimize the placement of funds, fees earned, and capital efficiency.',
  },
  [SteerStrategy.ChannelMultiplier]: {
    name: 'Channel Multiplier Pool',
    description:
      'This strategy uses a multiplier to make channel around the price. The wider the multiplier the wider area of coverage on channel on both side of current price.',
  },
  [SteerStrategy.FixedPercentage]: {
    name: 'Fixed Percentage Pool',
    description:
      'This strategy routinely sets a position of a provided percentage spreading above and below the current price.',
  },
  [SteerStrategy.PriceMultiplier]: {
    name: 'Price Multiplier Pool',
    description:
      'This strategy makes a position based on a multiplier of the current price of the pool. The multiplier makes a position from the price / multiplier to the price * multiplier.',
  },
  [SteerStrategy.KeltnerAlgo]: {
    name: 'Keltner Channel Pool',
    description:
      'This strategy uses recent trading data to form a Keltner Channel that sets the range to place optimal liquidity for a given period of time. The Keltner Channel is a technical indicator that measures volatility using upper and lower bands, and an exponential moving average. These bands adjust based on market volatility.',
  },
  [SteerStrategy.MovingVolatilityChannel]: {
    name: 'Moving Volatility Pool',
    description:
      'This strategy uses recent trading data to form a Keltner Channel that sets the range to place optimal liquidity for a given period of time. The Keltner Channel is a technical indicator that measures volatility using upper and lower bands, and an exponential moving average. These bands adjust based on market volatility.',
  },
}
