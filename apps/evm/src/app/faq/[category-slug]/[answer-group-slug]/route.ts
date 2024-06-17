import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { getFaqAnswerGroup } from '../../lib/strapi/answerGroup'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const pathname = new URL(request.url).pathname
  const answerGroupId = pathname.split('/').slice(-1)[0]
  const answerGroup = await getFaqAnswerGroup(answerGroupId)

  if (!answerGroup) {
    return redirect(pathname.split('/').slice(0, -1).join('/'))
  }

  redirect(`${pathname}/${answerGroup.defaultAnswer.slug}`)
}
