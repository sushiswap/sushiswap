'use client'

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SkeletonBox,
  SkeletonText,
  classNames,
} from '@sushiswap/ui'
import format from 'date-fns/format'
import { FC, useCallback, useMemo } from 'react'

import { formatUSD } from 'sushi/format'
import tailwindConfig from 'tailwind.config.js'
import resolveConfig from 'tailwindcss/resolveConfig'

import { PoolChartPeriod, chartPeriods } from './PoolChartPeriods'
import { PoolChartType } from './PoolChartTypes'

import { V2Pool, V3Pool } from '@sushiswap/graph-client/data-api'
import ReactEchartsCore from 'echarts-for-react/lib/core'
import { EChartsOption } from 'echarts-for-react/lib/types'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/visualMap'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/visual/seriesColor'
import { usePoolGraphData } from 'src/lib/hooks'
import { SushiSwapProtocol } from 'sushi'

interface PoolChartProps {
  chart: PoolChartType.Volume | PoolChartType.Fees | PoolChartType.TVL
  period: PoolChartPeriod
  pool: V2Pool | V3Pool
  protocol: SushiSwapProtocol
}

const tailwind = resolveConfig(tailwindConfig)

export const PoolChartGraph: FC<PoolChartProps> = ({
  chart,
  period,
  pool,
  protocol,
}) => {
  const { data: buckets, isInitialLoading: isLoading } = usePoolGraphData({
    poolAddress: pool.address,
    chainId: pool.chainId,
    protocol,
  })

  const [xData, yData]: [number[], number[]] = useMemo(() => {
    const data =
      (chartPeriods[period] < chartPeriods[PoolChartPeriod.Week]
        ? buckets?.hourBuckets
        : buckets?.dayBuckets) || []

    const currentDate = Math.round(Date.now())
    const [x, y] = data.reduce<[number[], number[]]>(
      (acc, cur) => {
        if (cur?.date * 1000 >= currentDate - chartPeriods[period]) {
          acc[0].push(cur?.date)
          if (chart === PoolChartType.Fees) {
            acc[1].push(Number(cur?.feesUSD))
          } else if (chart === PoolChartType.Volume) {
            acc[1].push(Number(cur?.volumeUSD))
          } else if (chart === PoolChartType.TVL) {
            acc[1].push(Number(cur?.liquidityUSD))
          }
        }
        return acc
      },
      [[], []],
    )

    return [x.reverse(), y.reverse()]
  }, [chart, period, buckets])
  // Transient update for performance
  const onMouseOver = useCallback(
    ({ name, value }: { name: number; value: number }) => {
      const valueNodes = document.getElementsByClassName('hoveredItemValue')
      const nameNodes = document.getElementsByClassName('hoveredItemName')

      if (valueNodes[0]) {
        valueNodes[0].innerHTML = formatUSD(value)
      }

      if (valueNodes[1]) {
        if (chart === PoolChartType.Volume) {
          valueNodes[1].innerHTML = formatUSD(value * Number(pool.swapFee))
        }
      }

      if (nameNodes[0]) {
        nameNodes[0].innerHTML = format(
          new Date(name * 1000),
          `dd MMM yyyy${
            chartPeriods[period] < chartPeriods[PoolChartPeriod.Week]
              ? ' p'
              : ''
          }`,
        )
      }
    },
    [period, chart, pool?.swapFee],
  )

  const DEFAULT_OPTION: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        extraCssText:
          'z-index: 1000; padding: 0 !important; box-shadow: none !important',
        responsive: true,
        // @ts-ignore
        backgroundColor: 'transparent',
        textStyle: {
          fontSize: 12,
          fontWeight: 600,
        },
        axisPointer: {
          lineStyle: {
            type: 'dashed',
          },
        },
        formatter: (params: any) => {
          onMouseOver({ name: params[0].name, value: params[0].value })

          const date = new Date(Number(params[0].name * 1000))
          return `<div class="flex flex-col gap-0.5 paper bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-xl overflow-hidden shadow-lg">
            <span class="text-sm dark:text-slate-50 text-gray-900 font-medium">${formatUSD(
              params[0].value,
            )}</span>
            <span class="text-xs text-gray-500 dark:text-slate-400 font-medium">${
              date instanceof Date && !Number.isNaN(date?.getTime())
                ? format(
                    date,
                    `dd MMM yyyy${
                      chartPeriods[period] < chartPeriods[PoolChartPeriod.Week]
                        ? ' p'
                        : ''
                    }`,
                  )
                : ''
            }</span>
          </div>`
        },
        borderWidth: 0,
      },
      toolbox: {
        show: false,
      },
      grid: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      dataZoom: {
        show: false,
        start: 0,
        end: 100,
      },
      visualMap: {
        show: false,
        // @ts-ignore
        color: [tailwind.theme.colors.blue['500']],
      },
      xAxis: [
        {
          show: false,
          type: 'category',
          data: xData,
        },
      ],
      yAxis: [
        {
          show: false,
          type: 'value',
          name: 'Volume',
        },
      ],
      series: [
        {
          name: 'Volume',
          type: chart === PoolChartType.TVL ? 'line' : 'bar',
          smooth: true,
          xAxisIndex: 0,
          yAxisIndex: 0,
          barWidth: '70%',
          itemStyle: {
            color: 'blue',
            normal: {
              barBorderRadius: 2,
            },
          },
          areaStyle: {
            // @ts-ignore
            color: tailwind.theme.colors.blue['500'],
          },
          animationEasing: 'elasticOut',
          animationDelayUpdate: (idx: number) => idx * 2,
          data: yData,
        },
      ],
    }),
    [xData, chart, yData, onMouseOver, period],
  )

  const defaultValue = yData[yData.length - 1] || 0

  return (
    <>
      <CardHeader>
        <CardTitle>
          <span className="hoveredItemValue">{formatUSD(defaultValue)}</span>{' '}
          {chart === PoolChartType.Volume && (
            <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
              <span className="text-xs top-[-2px] relative">•</span>{' '}
              <span className="hoveredItemValue">
                {formatUSD(defaultValue * Number(pool?.swapFee))}
              </span>{' '}
              earned
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {isLoading ? (
            <SkeletonText fontSize="sm" />
          ) : (
            <div className="text-sm text-gray-500 dark:text-slate-500 hoveredItemName">
              {format(
                new Date(xData[xData.length - 1] * 1000),
                'dd MMM yyyy HH:mm',
              )}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonBox
            className={classNames(
              'h-[400px] w-full dark:via-slate-800 dark:to-slate-900',
            )}
          />
        ) : (
          <ReactEchartsCore
            echarts={echarts}
            option={DEFAULT_OPTION}
            style={{ height: 400 }}
          />
        )}
      </CardContent>
    </>
  )
}
