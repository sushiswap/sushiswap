import defaultNextConfig from '@sushiswap/nextjs-config'

import { withAxiom } from 'next-axiom'

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...defaultNextConfig,
  transpilePackages: ['@sushiswap/ui'],
  compiler: {
    styledComponents: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        permanent: true,
        destination: '/swap',
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default withAxiom(nextConfig)
