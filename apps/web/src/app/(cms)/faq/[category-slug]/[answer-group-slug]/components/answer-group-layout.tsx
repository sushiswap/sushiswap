import { getFaqAnswerGroup } from '@sushiswap/graph-client/strapi'
import { Container } from '@sushiswap/ui'
import {
  Sidebar,
  SidebarDesktop,
  SidebarMobile,
} from '../../../components/sidebar'

export const revalidate = 900

interface AnswerGroupLayoutProps {
  children: React.ReactNode
  params: { 'answer-group-slug': string }
}

function AnswerGroupLayoutDesktop({
  children,
  sidebar,
}: { children: React.ReactNode; sidebar: Sidebar }) {
  return (
    <Container
      maxWidth="4xl"
      className="justify-between pb-40 pt-24 px-8 space-x-16 grid grid-cols-10"
    >
      <div className="col-span-2">
        <SidebarDesktop {...sidebar} />
      </div>
      <div className="min-h-full flex dark:bg-slate-600 bg-[#BFBFBF] w-[2px]" />
      <div className="col-span-7">{children}</div>
    </Container>
  )
}

function AnswerGroupLayoutMobile({
  children,
  sidebar,
}: { children: React.ReactNode; sidebar: Sidebar }) {
  return (
    <div className="w-full flex flex-col items-center px-5 pt-8 space-y-8">
      <div className="w-full">
        <SidebarMobile {...sidebar} />
      </div>
      {children}
    </div>
  )
}

export async function AnswerGroupLayout({
  children,
  params,
}: AnswerGroupLayoutProps) {
  const answerGroup = await getFaqAnswerGroup({
    slug: params['answer-group-slug'],
  })

  const sidebarEntries = answerGroup.answers.map((answer) => {
    return {
      name: answer.name,
      slug: answer.slug,
      url: `/faq/${answerGroup.category.slug}/${answerGroup.slug}/${answer.slug}`,
    }
  })

  const sidebar = {
    entries: sidebarEntries,
    param: 'answer-slug',
  }

  return (
    <>
      <div className="md:block hidden w-full pl-[calc(100vw-100%)]">
        <AnswerGroupLayoutDesktop sidebar={sidebar}>
          {children}
        </AnswerGroupLayoutDesktop>
      </div>
      <div className="w-full md:hidden block">
        <AnswerGroupLayoutMobile sidebar={sidebar}>
          {children}
        </AnswerGroupLayoutMobile>
      </div>
    </>
  )
}
