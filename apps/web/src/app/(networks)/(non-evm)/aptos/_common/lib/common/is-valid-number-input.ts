const regexPattern = /^(((0\.?)|[1-9][0-9]*)(\.[0-9]*)?)?$/

export function isValidNumberInput(value: string) {
  return regexPattern.test(value)
}
