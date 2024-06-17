import GhostContentAPI, { GhostContentAPIOptions } from '@tryghost/content-api'

interface CustomGhostContentAPIOptions extends GhostContentAPIOptions {
  makeRequest: (options: {
    url: string
    method: string
    params: Record<string, string>
    headers: Record<string, string>
  }) => Promise<any>
}

export function getGhostClient() {
  return new GhostContentAPI({
    url: 'https://ghost.sushi.com',
    key: '9a481331206651cecc033ae05f', // can be exposed, only access to public data
    version: 'v5.0',
    makeRequest: async ({ url, method, params, headers }) => {
      const apiUrl = new URL(url)

      Object.keys(params).map((key) =>
        apiUrl.searchParams.set(key, encodeURIComponent(params[key])),
      )

      const res = await fetch(apiUrl, { method, headers })

      if (res.status === 200) {
        const data = await res.json()
        return { data }
      } else {
        throw new Error('Failed to fetch data from Ghost')
      }
    },
  } as CustomGhostContentAPIOptions)
}

function processVideos(html: string) {
  html = html.replaceAll(/<div class="kg-video-overlay">(.*?)<\/div>/gms, '')
  html = html.replaceAll(
    /<div class="kg-video-player-container(.*?)<input type="range" class="kg-video-volume-slider" max="100" value="100">/gms,
    '',
  )
  html = html.replaceAll('<video src=', '<video controls=true src=')
  return html
}

export async function getGhostBody(slug: string) {
  const ghostClient = getGhostClient()

  let html

  try {
    ;({ html } = await ghostClient.posts.read({
      slug,
    }))
  } catch {}

  if (!html) {
    return ''
  }

  return processVideos(html)
}
