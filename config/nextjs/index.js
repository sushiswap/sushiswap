/** @type {import('next').NextConfig} */
const defaultNextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  swcMinify: true,
  poweredByHeader: false,
  staticPageGenerationTimeout: 180,
  experimental: {
    webpackBuildWorker: true,
    turbo: {},
    // Prepare for Next.js 14
    optimizePackageImports: [
      '@heroicons/react-v1/solid',
      '@heroicons/react-v1/outline',
      '@sushiswap/client',
      '@sushiswap/database',
      '@sushiswap/graph-client',
      '@sushiswap/hooks',
      '@sushiswap/react-query',
      '@sushiswap/router',
      '@sushiswap/tines',
      '@sushiswap/ui',
      'sushi',
      'date-fns',
    ],
  },
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/sushi-cdn/image/fetch/',
    domains: ['cdn.sushi.com'],
  },
  eslint: {
    dirs: [
      // ...
      'app',
      'components',
      'functions',
      'lib',
      'pages',
      'providers',
      'types',
      'ui',
    ],
  },
  webpack: (config, { webpack }) => {
    if (config.plugins) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(lokijs|pino-pretty|encoding)$/,
          resourceRegExp: /^(lokijs|pino-pretty|encoding|keyv)$/,
        }),
      )
    }
    // Ignore import trace warnings from graphclient & sentry
    config.ignoreWarnings = [
      {
        module: /node_modules\/@graphql-mesh\/utils\/esm\/defaultImportFn\.js/,
      },
      { file: /node_modules\/@graphql-mesh\/utils\/esm\/defaultImportFn\.js/ },
      {
        module: /node_modules\/@sentry\/utils\/esm\/index\.js/,
      },
      { file: /node_modules\/@sentry\/utils\/esm\/index\.js/ },
      {
        module: /node_modules\/@sentry\/utils\/esm\/isBrowser\.js/,
      },
      { file: /node_modules\/@sentry\/utils\/esm\/isBrowser\.js/ },
      {
        module: /node_modules\/@whatwg-node\/fetch\/dist\/node-ponyfill\.js/,
      },
      { file: /node_modules\/@whatwg-node\/fetch\/dist\/node-ponyfill\.js/ },
    ]
    return config
  },
}

module.exports = defaultNextConfig
