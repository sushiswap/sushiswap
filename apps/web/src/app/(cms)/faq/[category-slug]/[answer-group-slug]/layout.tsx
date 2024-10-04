import { getFaqAnswerGroup } from '@sushiswap/graph-client/strapi'
import { Breadcrumb, Container, typographyVariants } from '@sushiswap/ui'
import { notFound } from 'next/navigation'
import React from 'react'
import { AnswerGroupLayout } from './components/answer-group-layout'

export const revalidate = 900

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { 'answer-group-slug': string }
}) {
  let answerGroup

  try {
    answerGroup = await getFaqAnswerGroup({
      slug: params['answer-group-slug'],
    })
  } catch {
    return notFound()
  }

  return (
    <div>
      <div className="dark:bg-[#19202F] w-full pl-[calc(100vw-100%)]">
        <Container maxWidth="4xl" className="px-5 md:px-8 space-y-6 pb-14">
          <Breadcrumb replace={{ '-': ' ' }} truncate={false} />
          <h1 className={typographyVariants({ variant: 'h1' })}>
            {answerGroup.name}
          </h1>
        </Container>
      </div>
      <div className="h-[0.5px] bg-accent w-full" />
      <AnswerGroupLayout params={params}>{children}</AnswerGroupLayout>
    </div>
  )
}
