import ms from 'ms'

export const STALE_WHILE_REVALIDATE = ms('5m') // 5 minutes
export const STALE_TIME = STALE_WHILE_REVALIDATE - ms('15s') // 4 minute 45 seconds
