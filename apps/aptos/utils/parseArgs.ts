export function parseArgs<T>(args?: Partial<T>) {
  if (!args) return ''
  return Object.entries(args)
    .sort(([key1], [key2]) => key1.localeCompare(key2))
    .reduce((acc, [key, value]) => {
      if (value === undefined || value === null) return acc
      if (Array.isArray(value) && value.length === 0) return acc
      const param = `${key}=${Array.isArray(value) ? value.join(',') : value}`
      if (acc === '?') {
        return `${acc}${param}`
      } else {
        return `${acc}&${param}`
      }
    }, '?')
}
