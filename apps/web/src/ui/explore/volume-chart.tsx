'use client'

import { AnalyticsDayBuckets } from '@sushiswap/graph-client/data-api'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SkeletonBox,
  SkeletonText,
  Toggle,
  classNames,
} from '@sushiswap/ui'
import format from 'date-fns/format'
import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts-for-react/lib/types'
import { FC, useCallback, useMemo, useState } from 'react'
import { formatUSD } from 'sushi/format'
import tailwindConfig from 'tailwind.config.js'
import resolveConfig from 'tailwindcss/resolveConfig'

const tailwind = resolveConfig(tailwindConfig)

enum TvlChartPeriod {
  Day = 0,
  Week = 1,
  Month = 2,
  Year = 3,
  All = 4,
}

const chartTimespans: Record<TvlChartPeriod, number> = {
  [TvlChartPeriod.Day]: 86400 * 1000,
  [TvlChartPeriod.Week]: 604800 * 1000,
  [TvlChartPeriod.Month]: 2629746 * 1000,
  [TvlChartPeriod.Year]: 31556952 * 1000,
  [TvlChartPeriod.All]: Infinity,
}

export const VolumeChart: FC<{ data: AnalyticsDayBuckets }> = ({ data }) => {
  const [chartPeriod, setChartPeriod] = useState<TvlChartPeriod>(
    TvlChartPeriod.Month,
  )

  const [xData, yData] = useMemo(() => {
    const v2Data = data.v2.reverse()
    const v3Data = data.v3.reverse()

    const _xData = (v2Data.length > v3Data.length ? v2Data : v3Data).map(
      (data) => data.date,
    )

    const currentDate = Math.round(Date.now())
    const predicates = _xData.map(
      (x) => x * 1000 >= currentDate - chartTimespans[chartPeriod],
    )

    const yData = {
      v2: Array(_xData.length - v2Data.length)
        .fill(0)
        .concat(v2Data.map((data) => data.volumeUSD))
        .filter((_, i) => predicates[i]),
      v3: Array(_xData.length - v3Data.length)
        .fill(0)
        .concat(v3Data.map((data) => data.volumeUSD))
        .filter((_, i) => predicates[i]),
    }

    const xData = _xData.filter((_, i) => predicates[i])

    return [xData, yData]
  }, [data, chartPeriod])

  // Transient update for performance
  const onMouseOver = useCallback(
    ({ name, value }: { name: number; value: number }) => {
      const valueNodes = document.getElementsByClassName(
        'hoveredItemValueVolume',
      )
      const nameNodes = document.getElementsByClassName('hoveredItemNameVolume')

      valueNodes[0].innerHTML = formatUSD(value)
      nameNodes[0].innerHTML = format(
        new Date(name * 1000),
        'dd MMM yyyy HH:mm',
      )
    },
    [],
  )

  const DEFAULT_OPTION: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        extraCssText: 'z-index: 1000',
        responsive: true,
        // @ts-ignore
        backgroundColor: tailwind.theme.colors.slate['700'],
        textStyle: {
          // @ts-ignore
          color: tailwind.theme.colors.slate['50'],
          fontSize: 12,
          fontWeight: 600,
        },
        axisPointer: {
          lineStyle: {
            type: 'dashed',
          },
        },
        formatter: (params: any) => {
          onMouseOver({
            name: params[0].name,
            value: params[0].value + params[1].value,
          })

          const date = new Date(Number(params[0].name * 1000))
          return `<div class="flex flex-col gap-0.5">
            <span class="text-sm text-slate-50 font-bold">${formatUSD(
              params[0].value,
            )}</span>
            <span class="text-sm text-slate-50 font-bold">${formatUSD(
              params[1].value,
            )}</span>
            <span class="text-xs text-slate-400 font-medium">${
              date instanceof Date && !Number.isNaN(date?.getTime())
                ? format(date, 'dd MMM yyyy HH:mm')
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
        // color: [tailwind.theme.colors.blue['500']],
      },
      xAxis: [
        {
          show: false,
          type: 'category',
          boundaryGap: true,
          data: xData,
        },
      ],
      yAxis: [
        {
          show: false,
          type: 'value',
          scale: true,
          name: 'Volume',
          max: 'dataMax',
          min: 'dataMin',
        },
        {
          show: false,
          type: 'value',
          scale: true,
          name: 'Volume',
          max: 'dataMax',
          min: 'dataMin',
        },
      ],
      series: [
        {
          name: 'Volume',
          type: 'bar',
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
          data: yData.v2,
        },
        {
          name: 'Volume',
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 1,
          barWidth: '70%',
          itemStyle: {
            color: 'red',
            normal: {
              barBorderRadius: 2,
            },
          },
          areaStyle: {
            // @ts-ignore
            color: tailwind.theme.colors.red['500'],
          },
          animationEasing: 'elasticOut',
          animationDelayUpdate: (idx: number) => idx * 2,
          data: yData.v3,
        },
      ],
    }),
    [onMouseOver, xData, yData],
  )

  return (
    <div>
      <CardHeader>
        <CardTitle className="flex flex-col md:flex-row items-center justify-between gap-4">
          Volume
          <div className="flex gap-4">
            <Toggle
              size="xs"
              pressed={chartPeriod === TvlChartPeriod.Week}
              onClick={() => setChartPeriod(TvlChartPeriod.Week)}
              className={classNames(
                'font-semibold text-sm',
                chartPeriod === TvlChartPeriod.Week
                  ? 'text-blue'
                  : 'text-slate-500',
              )}
            >
              1W
            </Toggle>
            <Toggle
              size="xs"
              pressed={chartPeriod === TvlChartPeriod.Month}
              onClick={() => setChartPeriod(TvlChartPeriod.Month)}
              className={classNames(
                'font-semibold text-sm',
                chartPeriod === TvlChartPeriod.Month
                  ? 'text-blue'
                  : 'text-slate-500',
              )}
            >
              1M
            </Toggle>
            <Toggle
              size="xs"
              pressed={chartPeriod === TvlChartPeriod.Year}
              onClick={() => setChartPeriod(TvlChartPeriod.Year)}
              className={classNames(
                'font-semibold text-sm',
                chartPeriod === TvlChartPeriod.Year
                  ? 'text-blue'
                  : 'text-slate-500',
              )}
            >
              1Y
            </Toggle>
            <Toggle
              size="xs"
              pressed={chartPeriod === TvlChartPeriod.All}
              onClick={() => setChartPeriod(TvlChartPeriod.All)}
              className={classNames(
                'font-semibold text-sm',
                chartPeriod === TvlChartPeriod.All
                  ? 'text-blue'
                  : 'text-slate-500',
              )}
            >
              ALL
            </Toggle>
          </div>
        </CardTitle>
      </CardHeader>
      <CardHeader className="border-t border-accent">
        <CardTitle>
          <span className="hoveredItemValueVolume">
            {formatUSD(
              yData.v2[yData.v2.length - 1] + yData.v3[yData.v3.length - 1],
            )}
          </span>
        </CardTitle>
        <CardDescription>
          {xData?.length ? (
            <div className="text-sm text-gray-500 dark:text-slate-500 hoveredItemNameVolume">
              {format(
                new Date(xData[xData.length - 1] * 1000),
                'dd MMM yyyy HH:mm',
              )}
            </div>
          ) : (
            <SkeletonText fontSize="sm" />
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {xData ? (
          <ReactECharts option={DEFAULT_OPTION} style={{ height: 400 }} />
        ) : (
          <SkeletonBox
            className={classNames(
              'h-[400px] w-full dark:via-slate-800 dark:to-slate-900',
            )}
          />
        )}
      </CardContent>
    </div>
  )
}
