export function formatNumber(num?: number, decimals = 2) {
  if (!num) return 0
  if (Math.abs(num) < 1_000) {
    return num.toLocaleString('EN', { maximumFractionDigits: decimals }) // Return the number itself if it's less than 1,000
  }

  const units = ['k', 'M', 'G', 'T', 'P']
  const exponent = Math.floor(Math.log10(Math.abs(num)) / 3)
  const unit = units[exponent - 1]
  const value = num / 1000 ** exponent

  return `${parseFloat(value.toFixed(1))}${unit}`
}

export function endOfPreviousQuarter(timestamp: number) {
  const date = new Date(timestamp)

  let quarter = Math.floor((date.getMonth() + 3) / 3) - 1
  let year = date.getFullYear()

  if (!quarter) {
    quarter = 4
    year -= 1 // Previous year
  }

  const endMonth = quarter * 3 // End month of the previous quarter
  const endDay = new Date(year, endMonth, 0).getDate() // Get the last day of the end month
  const endDate = new Date(year, endMonth - 1, endDay) // Month is 0-indexed

  return endDate.getTime()
}

export function getPercentageDiff(newValue: number, oldValue: number) {
  return (newValue - oldValue) / oldValue
}
