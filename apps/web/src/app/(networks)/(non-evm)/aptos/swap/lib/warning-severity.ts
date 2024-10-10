import { Percent } from 'sushi'

// one basis JSBI.BigInt
const BIPS_BASE = 10000n

// used for warning states
const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(100, BIPS_BASE) // 1%
const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(300, BIPS_BASE) // 3%
const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(500, BIPS_BASE) // 5%
const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(1500, BIPS_BASE) // 15%

const IMPACT_TIERS = [
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  ALLOWED_PRICE_IMPACT_LOW,
]

type WarningSeverity = 0 | 1 | 2 | 3 | 4
export function warningSeverity(
  priceImpact: number | undefined,
): WarningSeverity {
  if (!priceImpact) return 0
  let impact: WarningSeverity = IMPACT_TIERS.length as WarningSeverity
  for (const impactLevel of IMPACT_TIERS) {
    if (Number(impactLevel.toFixed(2)) < priceImpact) return impact
    impact--
  }
  return 0
}

export const warningSeverityClassName = (severity: WarningSeverity) => {
  if (severity === 0 || severity === 1) return ''
  if (severity <= 3) return '!text-yellow'
  return '!text-red'
}
