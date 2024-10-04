import { FaqCategory, getFaqCategory } from '@sushiswap/graph-client/strapi'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 900

function AnswerGroup({
  category,
  answerGroup,
}: {
  category: FaqCategory
  answerGroup: FaqCategory['answerGroups'][number]
}) {
  return (
    <div>
      <div className="text-xl font-medium border border-neutral-700 rounded-t-lg p-6">
        {answerGroup.name}
      </div>
      <div className="border-neutral-700 border border-t-0 rounded-b-lg p-6 space-y-3">
        {answerGroup.answers.map((answer) => (
          <div key={answer.slug}>
            <Link
              href={`/faq/${category.slug}/${answerGroup.slug}/${answer.slug}`}
            >
              <div className="hover:text-gray-400">{answer.name}</div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function FaqCategoryPage({
  params,
}: {
  params: { 'category-slug': string }
}) {
  let category

  try {
    category = await getFaqCategory({ slug: params['category-slug'] })
  } catch {
    return notFound()
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-6">
        {category.answerGroups.map((answerGroup) => (
          <AnswerGroup
            key={answerGroup.slug}
            category={category}
            answerGroup={answerGroup}
          />
        ))}
      </div>
    </div>
  )
}
