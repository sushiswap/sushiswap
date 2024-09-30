import { NextResponse } from 'next/server'
import { BITQUERY_ENDPOINT } from '~tron/_common/lib/bitquery/bitquery-endpoint'
import { getOptions } from '~tron/_common/lib/bitquery/bitquery-options'
import { getTronInUSDT } from '~tron/_common/lib/bitquery/queries/getTronInUSDT'

// revalidate every 2 minutes

export const dynamic = 'force-dynamic'
export const revalidate = 120

export async function GET(): Promise<NextResponse> {
  try {
    const query = getTronInUSDT()

    const options = getOptions(query)

    const res = await fetch(BITQUERY_ENDPOINT, {
      ...options,
    })
    if (!res.ok) {
      throw new Error('Failed to fetch data from Bitquery API')
    }
    const data = await res.json()

    return NextResponse.json({ ...data })
  } catch (error) {
    console.error(error)
    return NextResponse.json(undefined)
  }
}
