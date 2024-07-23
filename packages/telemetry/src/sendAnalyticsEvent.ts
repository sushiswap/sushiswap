import { init, track } from '@amplitude/analytics-browser'

typeof window !== 'undefined' && init('1a4621bcd5f74de90bb1cd5253e28f06')

export function sendAnalyticsEvent(
  eventName: string,
  eventProperties?: Record<string, unknown>,
) {
  const origin = window.location.origin

  track(eventName, { ...eventProperties, origin })
}
