import 'dotenv/config'

import process from 'node:process'
import {
  Handlers as SentryHandlers,
  Integrations as SentryIntegrations,
  captureMessage,
  init as initSentry,
} from '@sentry/node'
import { Logger, LogsMessageLevel } from '@sushiswap/extractor'
import cors from 'cors'
import express, { type Express, type Response } from 'express'
import { ChainId } from 'sushi/chain'
import { ExtractorClient } from './ExtractorClient.js'
import swapRequestStatistics from './SwapRequestStatistics.js'
import {
  CHAIN_ID,
  EXTRACTOR_SERVER,
  POOL_UPDATE_INTERVAL,
  PORT,
  REQUESTED_PAIRS_UPDATE_INTERVAL,
  ROUTER_CONFIG,
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
} from './config.js'
import { CPUUsageStatistics } from './cpu-usage-statistics.js'
import { priceByAddressHandler, pricesHandler } from './handlers/price/index.js'
import { swapV3_2, swapV4 } from './handlers/swap/index.js'
import { swapV4_2 } from './handlers/swap2/index.js'
import tokenHandler from './handlers/token/index.js'
import { updatePrices } from './prices.js'

export let extractorClient: ExtractorClient | undefined

async function start() {
  const app: Express = express()

  const client = new ExtractorClient(
    CHAIN_ID as ChainId,
    EXTRACTOR_SERVER as string,
    POOL_UPDATE_INTERVAL(CHAIN_ID as ChainId),
    REQUESTED_PAIRS_UPDATE_INTERVAL(CHAIN_ID as ChainId),
  )
  extractorClient = client
  if (
    ROUTER_CONFIG[CHAIN_ID]?.['priceIncrementalMode'] === false ||
    ROUTER_CONFIG[CHAIN_ID]?.['checkPricesIncrementalModeCorrectness'] === true
  )
    updatePrices(client)
  // client.on('firstPoolsUpdate', () =>{
  //   updatePrices(client)
  // })
  client.start()
  initSentry({
    sampleRate: 1,
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    integrations: [
      // enable HTTP calls tracing
      new SentryIntegrations.Http({
        breadcrumbs: true,
        tracing: true,
      }),
      // enable Express.js middleware tracing
      new SentryIntegrations.Express({
        app,
      }),
    ],
    // Performance Monitoring
    enableTracing: true,
    tracesSampleRate: 1,
  })

  Logger.setLogsExternalHandler(
    (
      msg: string,
      level: LogsMessageLevel,
      context?: string,
      trace_id?: string,
    ) => {
      captureMessage(
        msg,
        context === undefined
          ? level
          : {
              level,
              contexts: {
                trace: {
                  data: { context },
                  trace_id: trace_id ?? '0',
                  span_id: '0',
                },
              },
            },
      )
    },
  )

  swapRequestStatistics.start()

  // RequestHandler creates a separate execution context, so that all
  // transactions/spans/breadcrumbs are isolated across requests
  app.use(SentryHandlers.requestHandler())
  // TracingHandler creates a trace for every incoming request
  app.use(SentryHandlers.tracingHandler())

  app.use(cors())

  const cpuUsageStatistics = new CPUUsageStatistics(60_000)
  cpuUsageStatistics.start()

  app.get('/200', (_, res: Response) => {
    return res.status(200).end()
  })

  app.get('/health', (_, res: Response) => {
    return res.status(client.ready ? 200 : 503).send()
  })

  app.get(`/swap/v3.2/${CHAIN_ID}`, (req, res) => {
    return swapV3_2(client)(req, res)
  })
  app.get(`/swap/v4/${CHAIN_ID}`, (req, res) => {
    return swapV4(client)(req, res)
  })
  app.get(`/swap/v4_2/${CHAIN_ID}`, (req, res) => {
    return swapV4_2(client)(req, res)
  })

  app.get(`/token/v1/${CHAIN_ID}/:address`, tokenHandler(client))

  app.get(`/price/v1/${CHAIN_ID}`, pricesHandler)
  app.get(`/price/v1/${CHAIN_ID}/:address`, priceByAddressHandler)

  // The error handler must be registered before any other error middleware and after all controllers
  app.use(SentryHandlers.errorHandler())

  app.listen(PORT, () => {
    console.log(`Router ${CHAIN_ID} app listening on port ${PORT}`)
  })
}

process.on('SIGTERM', (code) => {
  console.log(`About to exit with code: ${code}`)
})

start()
