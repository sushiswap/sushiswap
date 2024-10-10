import { NextRequest, NextResponse } from 'next/server'
import { ChainKey, getChainInfo } from 'sushi/chain'
import { isSushiSwapChainId } from 'sushi/config'

export const config = {
  matcher: [
    '/swap/:path*',
    '/limit/:path*',
    '/dca/:path*',
    '/cross-chain-swap/:path*',
    '/pool',
    '/pools',
    '/explore',
    '/:chainId/swap/:path*',
    '/:chainId/limit/:path*',
    '/:chainId/dca/:path*',
    '/:chainId/cross-chain-swap/:path*',
    '/:chainId/explore/:path*',
    '/:chainId/pool/:path*',
    '/:chainId/positions/:path*',
    '/:chainId/migrate',
    '/:chainId/rewards',
  ],
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams, search } = req.nextUrl

  if (
    pathname === '/explore' ||
    pathname === '/pools' ||
    pathname === '/pool' ||
    pathname === '/swap' ||
    pathname === '/limit' ||
    pathname === '/dca' ||
    pathname === '/cross-chain-swap'
  ) {
    const path = ['/explore', '/pools'].includes(pathname)
      ? 'explore/pools'
      : pathname.slice(1)

    const cookie = req.cookies.get('wagmi.store')
    if (cookie) {
      const wagmiState = JSON.parse(cookie.value)
      const chainId = wagmiState?.state?.chainId
      if (isSushiSwapChainId(chainId)) {
        return NextResponse.redirect(
          new URL(`/${ChainKey[chainId]}/${path}`, req.url),
        )
      }
    }

    return NextResponse.redirect(new URL(`/ethereum/${path}`, req.url))
  }

  const networkNameMatch = pathname.match(
    /([\w-]+)(?=\/swap|\/limit|\/dca|\/cross-chain-swap|\/explore|\/pool|\/positions|\/rewards|\/migrate)/,
  )
  if (networkNameMatch?.length) {
    const { chainId, networkName } = getChainInfo(networkNameMatch[0])
    if (!chainId) return NextResponse.next()

    const url = req.nextUrl.clone()
    url.pathname = pathname.replace(networkName, chainId.toString())

    if (pathname.includes('cross-chain-swap')) {
      if (
        search !== '' &&
        searchParams.has('token0') &&
        searchParams.has('token1')
      ) {
        const token0 = searchParams.get('token0')?.toLowerCase()
        const token1 = searchParams.get('token1')?.toLowerCase()

        // Tokens cant be the same
        if (token0 === token1) {
          searchParams.delete('token0')
          searchParams.delete('token1')
          url.search = `?${searchParams.toString()}`
          return NextResponse.redirect(url)
        }
      }
    }

    if (pathname.includes('swap')) {
      if (
        search !== '' &&
        searchParams.has('chainId0') &&
        searchParams.has('chainId1')
      ) {
        const chainId0 = searchParams.get('chainId0')?.toLowerCase()
        const chainId1 = searchParams.get('chainId1')?.toLowerCase()

        // ChainIds cant be the same
        if (chainId0 === chainId1) {
          searchParams.delete('chainId0')
          searchParams.delete('chainId1')
          searchParams.delete('token0')
          searchParams.delete('token1')
          url.search = `?${searchParams.toString()}`
          return NextResponse.redirect(url)
        }
      }
    }

    return NextResponse.rewrite(url)
  }
}
