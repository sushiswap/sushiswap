import { getFaqAnswer } from '@sushiswap/graph-client/strapi'
import { notFound } from 'next/navigation'
import { getGhostBody } from 'src/app/(cms)/lib/ghost/ghost'

export const revalidate = 3600

export default async function AnswerPage({
  params,
}: { params: { 'answer-slug': string } }) {
  let answer
  let body

  try {
    answer = await getFaqAnswer({ slug: params['answer-slug'] })

    const { html } = await getGhostBody(answer.ghostSlug)
    body = html
  } catch {
    return notFound()
  }

  return (
    <div
      className="prose dark:!prose-invert"
      dangerouslySetInnerHTML={{
        __html: body || '',
      }}
    />
  )
}
