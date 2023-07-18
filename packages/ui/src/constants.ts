import { AppType } from './types'

export const HEADER_HEIGHT = 56

export const APP_TYPE_LINKS = {
  [AppType.Root]: '/',
  [AppType.Legacy]: 'https://app.sushi.com',
  [AppType.Blog]: '/blog',
  [AppType.Bridge]: '/bridge',
  [AppType.Swap]: '/swap',
  [AppType.xSwap]: '/xswap',
  [AppType.Furo]: '/furo',
  [AppType.Internal]: '/internal',
  [AppType.Kashi]: '/kashi',
  [AppType.Analytics]: '/analytics',
  [AppType.Earn]: '/earn',
  [AppType.Partner]: '/partner',
  [AppType.Widget]: '/widget',
  [AppType.Academy]: '/academy',
  [AppType.Governance_dashboard]: '/governance-dashboard',
}
