import { getFaqAnswer } from '../../../lib/strapi/answer'

export const revalidate = 3600

export default async function AnswerPage({
  params,
}: { params: { 'answer-slug': string } }) {
  const answer = await getFaqAnswer(params['answer-slug'])

  return (
    <div
      className="prose dark:!prose-invert prose-slate"
      dangerouslySetInnerHTML={{
        __html: answer.body || '',
      }}
    />
  )
}
