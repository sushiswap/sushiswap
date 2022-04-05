import { useRouter } from 'next/router'
import { FC, useMemo } from 'react'
import { getBuiltGraphSDK } from '../../.graphclient'
import {
  AnimatedAxis, // any of these can be non-animated equivalents
  AnimatedGrid,
  AnimatedLineSeries,
  XYChart,
  Tooltip,
} from '@visx/xychart'
import { useEffect } from 'react'
import { useState } from 'react'
import { curveStep } from '@visx/curve'
import Main from '../../components/Main'

interface Props {
  vesting: Vesting
  transactions: Transaction[]
  schedule: Schedule
}

interface Vesting {
  id: string
  status: string
  steps: string
  startedAt: string
  expiresAt: string
  cliffDuration: string
  stepDuration: string
  stepAmount: string
  cliffAmount: string
  totalAmount: string
  withdrawnAmount: string
  fromBentoBox: boolean
  token: Token
  recipient: User
  createdBy: User
}

interface Transaction {
  id: string
  type: string
  amount: string
  toBentoBox: false
  withdrawnAmount: string
  createdAtBlock: string
  createdAtTimestamp: string
  token: Token
}

interface Token {
  id: string
  symbol: string
  name: string
  decimals: string
}

interface User {
  id: string
}

interface Schedule {
  periods: Period[]
}

interface Period {
  id: string
  type: string
  time: string
  amount: string
}

const Vesting: FC<Props> = (props) => {
  const router = useRouter()
  const id = router.query.id as string
  let { vesting, transactions, schedule } = props
  const [chartData, setChartData] = useState<{ x; y }[]>()

  useEffect(() => {
    const data = schedule.periods.map((period) => {
      const date = new Date(parseInt(period.time) * 1000)
      return {
        x: date.toISOString().slice(0, 10),
        y: period.amount,
      }
    })
    setChartData(data)
  }, [schedule])

  const accessors = {
    xAccessor: (d) => d.x,
    yAccessor: (d) => d.y,
  }

  return (
    <Main>
      <div className="px-2 pt-16">
        <h1 className="py-4 text-2xl font-bold">Vesting</h1>
        <div className="grid gap-2">
          {vesting ? (
            <div key={vesting.id}>
              {vesting.status} {``}
              {vesting.totalAmount} {``} {vesting.token.symbol} {``}
              {new Date(parseInt(vesting.startedAt) * 1000).toLocaleString()} {``}
              {new Date(parseInt(vesting.expiresAt) * 1000).toLocaleString()}
            </div>
          ) : (
            <div>
              <i>No Vesting found..</i>
            </div>
          )}
        </div>
        <h2 className="py-4 text-2xl font-bold">Transactions</h2>
        <div className="grid gap-2">
          {transactions.length ? (
            Object.values(transactions).map((transaction) => (
              <div key={transaction.id}>
                {transaction.type} {``}
                {transaction.amount} {``} {transaction.token.symbol} {``}
                {new Date(parseInt(transaction.createdAtTimestamp) * 1000).toLocaleDateString()} {``}
              </div>
            ))
          ) : (
            <div>
              <i>No transactions found..</i>
            </div>
          )}
        </div>

        <XYChart
          height={350}
          width={900}
          xScale={{ type: 'band' }}
          yScale={{ type: 'linear', domain: [0, parseInt(vesting.totalAmount) * 1.33] }}
        >
          <AnimatedAxis orientation="left" numTicks={4} />
          <AnimatedAxis orientation="bottom" />
          <AnimatedGrid columns={false} numTicks={4} />
          <AnimatedLineSeries dataKey={''} data={chartData ?? []} {...accessors} curve={curveStep} />
          <Tooltip
            snapTooltipToDatumX
            snapTooltipToDatumY
            showSeriesGlyphs
            renderTooltip={({ tooltipData, colorScale }) => (
              <div>
                <div style={{ color: colorScale(tooltipData.nearestDatum.key) }}>{tooltipData.nearestDatum.key}</div>
                {accessors.xAccessor(tooltipData.nearestDatum.datum)}
                {', '}
                {accessors.yAccessor(tooltipData.nearestDatum.datum)}
              </div>
            )}
          />
        </XYChart>

        <h2 className="py-4 text-2xl font-bold">Schedule periods</h2>
        <div className="grid gap-2">
          {schedule.periods.length ? (
            Object.values(schedule.periods).map((period) => (
              <div key={period.id}>
                {period.type} {``} {new Date(parseInt(period.time) * 1000).toLocaleString()} {``} {period.amount}
              </div>
            ))
          ) : (
            <div>
              <i>No schedule data found..</i>
            </div>
          )}
        </div>
      </div>
    </Main>
  )
}

export default Vesting

export async function getServerSideProps({ query }) {
  const sdk = await getBuiltGraphSDK()
  const vesting = (await sdk.Vesting({ id: query.id })).vesting
  const transactions = (await sdk.VestingTransactions({ id: query.id })).vestingTransactions
  const schedule = (await sdk.VestingSchedule({ id: query.id })).vesting.schedule
  return {
    props: {
      vesting,
      transactions,
      schedule,
    },
  }
}
