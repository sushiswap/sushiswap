import { getBlogArticles } from '@sushiswap/graph-client/strapi'
import { ArticleListClient } from './article-list-client'

export const revalidate = 15

export async function ArticleList() {
  console.log('Running ARTICLELIST')

  const { articles, meta } = await getBlogArticles({
    pagination: { page: 0, pageSize: 9 },
  })

  return <ArticleListClient initialArticles={articles} initialMeta={meta} />
}
