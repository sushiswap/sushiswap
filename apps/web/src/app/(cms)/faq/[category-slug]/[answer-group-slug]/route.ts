import { getFaqAnswerGroup } from '@sushiswap/graph-client/strapi'
import { notFound, redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const pathname = new URL(request.url).pathname
  const answerGroupId = pathname.split('/').slice(-1)[0]
  const answerGroup = await getFaqAnswerGroup({ slug: answerGroupId })

  if (!answerGroup) {
    return redirect(pathname.split('/').slice(0, -1).join('/'))
  }

  const slug = answerGroup.defaultAnswer?.slug || answerGroup.answers?.[0].slug

  if (!slug) {
    return notFound()
  }

  redirect(`${pathname}/${slug}`)
}
