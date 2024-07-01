export function sendAnalyticsEvent(
  eventName: string,
  eventProperties?: Record<string, unknown>,
) {
  typeof window.gtag !== 'undefined' &&
    window.gtag('event', eventName, eventProperties)
}
