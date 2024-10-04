import { ChevronRightIcon } from '@heroicons/react/24/solid'
import {
  FaqMostSearched,
  getFaqMostSearched,
} from '@sushiswap/graph-client/strapi'
import Link from 'next/link'

function Question({ question, url }: FaqMostSearched[number]) {
  return (
    <div className="">
      <Link
        href={url}
        className="flex flex-row items-center justify-between space-x-4"
        prefetch={true}
      >
        <div className="dark:hover:text-slate-300 hover:text-neutral-600">
          {question}
        </div>
        <div>
          <ChevronRightIcon width={28} height={28} />
        </div>
      </Link>
    </div>
  )
}

function MostSearchedQuestionsDesktop({
  questions,
}: { questions: FaqMostSearched }) {
  const firstHalf = questions.slice(0, Math.ceil(questions.length / 2))
  const secondHalf = questions.slice(Math.ceil(questions.length / 2))

  return (
    <div className="grid grid-cols-2 gap-x-16 lg:gap-x-24">
      <div className="divide-y divide-slate-500 divide-opacity-50">
        {firstHalf.map((topic, i) => (
          <div key={i} className="pt-2.5 pb-2.5 first:pt-0 last:pb-0">
            <Question {...topic} />
          </div>
        ))}
      </div>
      <div className="divide-y divide-slate-500 divide-opacity-50">
        {secondHalf.map((topic, i) => (
          <div key={i} className="pt-2.5 pb-2.5 first:pt-0 last:pb-0">
            <Question {...topic} />
          </div>
        ))}
      </div>
    </div>
  )
}

function MostSearchedQuestionsMobile({
  questions,
}: { questions: FaqMostSearched }) {
  return (
    <div className="divide-y divide-slate-500 divide-opacity-50 gap-y-4">
      {questions.map((topic, i) => (
        <div key={i} className="first:pt-0 py-3 last:pb-0">
          <Question {...topic} />
        </div>
      ))}
    </div>
  )
}

export async function MostSearchedQuestions() {
  const questions = await getFaqMostSearched()

  return (
    <div className="flex flex-col space-y-8 md:space-y-12">
      <div className="text-2xl font-medium">Most Searched Questions</div>

      <div>
        <div className="md:block hidden">
          <MostSearchedQuestionsDesktop questions={questions} />
        </div>
        <div className="md:hidden block">
          <MostSearchedQuestionsMobile questions={questions} />
        </div>
      </div>
    </div>
  )
}
