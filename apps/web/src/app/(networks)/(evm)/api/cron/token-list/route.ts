import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { DEFAULT_LIST_OF_LISTS } from 'sushi'

export async function GET(req: Request) {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json('Unauthorized', { status: 401 })
  }

  if (!process.env.UPSTASH_SUSHISWAP_REDIS_REST_URL)
    throw new Error('UPSTASH_REDIS_REST_URL undefined')
  if (!process.env.UPSTASH_SUSHISWAP_REDIS_REST_TOKEN)
    throw new Error('UPSTASH_REDIS_REST_TOKEN undefined')

  const redis = new Redis({
    url: process.env.UPSTASH_SUSHISWAP_REDIS_REST_URL,
    token: process.env.UPSTASH_SUSHISWAP_REDIS_REST_TOKEN,
  })

  const promises = DEFAULT_LIST_OF_LISTS.map(async (el) => {
    const REDIS_KEY_PREFIX = 'token-list-v2-'
    const url = el.toLowerCase()
    const key = `${REDIS_KEY_PREFIX}-${url}`

    try {
      const res = await fetch(url)
      const data = await res.json()
      const status = await redis.set(key, JSON.stringify(data))
      if (status !== 'OK') {
        throw new Error(`Could not store data to redis, ${url}, ${status}`)
      }
    } catch (e) {
      console.error(`ERROR setting list, ${url}, ${e}`)
      throw e
    }
  })

  await Promise.allSettled(promises)

  return NextResponse.json({}, { status: 200 })
}
