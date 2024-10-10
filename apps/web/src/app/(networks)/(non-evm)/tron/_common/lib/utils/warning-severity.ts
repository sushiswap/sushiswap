import sharedConfig from '@sushiswap/tailwindcss-config'

// one basis JSBI.BigInt
// const BIPS_BASE = BigInt(10000);

// // used for warning states
// export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(BigInt(100), BIPS_BASE); // 1%
// export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(BigInt(300), BIPS_BASE); // 3%
// export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(BigInt(500), BIPS_BASE); // 5%
// export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(BigInt(1500), BIPS_BASE); // 15%

// const IMPACT_TIERS = [
// 	BLOCKED_PRICE_IMPACT_NON_EXPERT,
// 	ALLOWED_PRICE_IMPACT_HIGH,
// 	ALLOWED_PRICE_IMPACT_MEDIUM,
// 	ALLOWED_PRICE_IMPACT_LOW,
// ];

type WarningSeverity = 0 | 1 | 2 | 3 | 4
export function warningSeverity(
  priceImpactPercentage: number | undefined,
): WarningSeverity {
  if (!priceImpactPercentage) return 0
  if (priceImpactPercentage < 1) return 0
  if (priceImpactPercentage < 3) return 1
  if (priceImpactPercentage < 5) return 2
  if (priceImpactPercentage < 15) return 3
  return 4
}

export const warningSeverityClassName = (severity: WarningSeverity): string => {
  if (severity === 0 || severity === 1) return ''
  if (severity <= 2) return sharedConfig.theme.extend.colors.yellow.DEFAULT
  return sharedConfig.theme.extend.colors.red.DEFAULT
}
