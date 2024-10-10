import { NextResponse } from 'next/server'
import { BITQUERY_ENDPOINT } from '~tron/_common/lib/bitquery/bitquery-endpoint'
import { getOptions } from '~tron/_common/lib/bitquery/bitquery-options'
import { getTransfersToPairs } from '~tron/_common/lib/bitquery/queries/getTransfersToPairs'

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const pairAddresses = searchParams.get('pairAddresses')
  const walletAddress = searchParams.get('walletAddress')

  if (!pairAddresses) {
    return NextResponse.json({
      success: false,
      message: 'pairAddresses is required',
    })
  }

  if (!walletAddress) {
    return NextResponse.json({
      success: false,
      message: 'walletAddress is required',
    })
  }

  try {
    const pairAddressArray = pairAddresses.split(',')
    const query = getTransfersToPairs(pairAddressArray, walletAddress)

    const options = getOptions(query)

    const res = await fetch(BITQUERY_ENDPOINT, {
      ...options,
      next: { revalidate: 60 },
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
