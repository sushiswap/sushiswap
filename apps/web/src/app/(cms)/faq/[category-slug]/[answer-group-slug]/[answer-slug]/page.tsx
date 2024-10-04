import { getFaqAnswer } from '@sushiswap/graph-client/strapi'
import { getGhostBody } from 'src/app/(cms)/lib/ghost/ghost'

export const revalidate = 3600

export default async function AnswerPage({
  params,
}: { params: { 'answer-slug': string } }) {
  const answer = await getFaqAnswer({ slug: params['answer-slug'] })

  const { html: body } = await getGhostBody(answer.ghostSlug)

  return (
    <div
      className="prose dark:!prose-invert prose-slate"
      dangerouslySetInnerHTML={{
        __html: body || '',
      }}
    />
  )
}
