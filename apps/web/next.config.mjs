import withBundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'
import defaultNextConfig from '@sushiswap/nextjs-config'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: false && process.env.NODE_ENV !== 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = bundleAnalyzer({
  ...defaultNextConfig,
  experimental: {
    ...defaultNextConfig.experimental,
    testProxy: process.env.NEXT_PUBLIC_APP_ENV === 'test',
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'test.sushi.com',
          },
        ],
        destination: 'https://sushi.com/test/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'aptos.sushi.com',
          },
        ],
        destination: 'https://sushi.com/aptos/:path*',
        permanent: true,
      },
      {
        source: '/aptos',
        permanent: true,
        destination: '/aptos/swap',
      },
      {
        source: '/tron',
        permanent: true,
        destination: '/tron/swap',
      },
      {
        source: '/',
        permanent: true,
        destination: '/swap',
      },
      {
        source: '/discord{/}?',
        permanent: true,
        destination: 'https://discord.gg/ej78AWjy6Y',
      },
      {
        source: '/github{/}?',
        permanent: true,
        destination: 'https://github.com/sushiswap',
      },
      {
        source: '/twitter{/}?',
        permanent: true,
        destination: 'https://twitter.com/sushiswap',
      },
      {
        source: '/instagram{/}?',
        permanent: true,
        destination: 'https://instagram.com/instasushiswap',
      },
      {
        source: '/medium{/}?',
        permanent: true,
        destination: 'https://medium.com/sushiswap-org',
      },
      {
        source: '/swap/cross-chain:path*',
        permanent: true,
        destination: '/cross-chain-swap:path*',
      },
    ]
  },
  async rewrites() {
    return []
  },
})

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'sushi-j9',
  project: 'web',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,

  // Disables Sentry's telemetry features
  telemetry: false,
})
