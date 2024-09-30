import { NextResponse } from 'next/server'
import { BITQUERY_ENDPOINT } from '~tron/_common/lib/bitquery/bitquery-endpoint'
import { getOptions } from '~tron/_common/lib/bitquery/bitquery-options'
import { getAllPools } from '~tron/_common/lib/bitquery/queries/getAllPools'

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const factoryAddress = searchParams.get('factoryAddress')

  if (!factoryAddress) {
    return NextResponse.json({
      success: false,
      message: 'factoryAddress is required',
    })
  }

  try {
    const query = getAllPools(factoryAddress)

    const options = getOptions(query)

    const res = await fetch(BITQUERY_ENDPOINT, {
      ...options,
      next: { revalidate: 120 },
    }) // revalidate every 2 minutes
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
