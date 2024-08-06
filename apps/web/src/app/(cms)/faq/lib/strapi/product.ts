// import { z } from 'zod'
// import { strapi } from './strapi'

// const schema = z
//   .array(
//     z
//       .object({
//         id: z.number(),
//         attributes: z.object({
//           name: z.string(),
//           slug: z.string(),
//           faqAnswerGroups: z.object({
//             data: z.array(
//               z.object({
//                 id: z.number(),
//                 attributes: z.object({
//                   name: z.string(),
//                   slug: z.string(),
//                   faqDefaultAnswer: z.object({
//                     data: z.object({
//                       attributes: z.object({
//                         name: z.string(),
//                         slug: z.string(),
//                       }),
//                     }),
//                   }),
//                   faqAnswers: z.object({
//                     data: z.array(
//                       z.object({
//                         attributes: z.object({
//                           name: z.string(),
//                           slug: z.string(),
//                         }),
//                       }),
//                     ),
//                   }),
//                 }),
//               }),
//             ),
//           }),
//         }),
//       })
//       .transform((data) => ({
//         name: data.attributes.name,
//         slug: data.attributes.slug,
//         answerGroups: data.attributes.faqAnswerGroups.data.map((group) => ({
//           name: group.attributes.name,
//           slug: group.attributes.slug,
//           defaultAnswer: {
//             name: group.attributes.faqDefaultAnswer.data.attributes.name,
//             slug: group.attributes.faqDefaultAnswer.data.attributes.slug,
//           },
//           answers: group.attributes.faqAnswers.data.map((answer) => ({
//             name: answer.attributes.name,
//             slug: answer.attributes.slug,
//           })),
//         })),
//       })),
//   )
//   .transform((data) => data[0])

// export type Product = z.infer<typeof schema>

// export async function getFaqProduct(id: string) {
//   const { data } = await strapi.find('faq-products', {
//     fields: ['name', 'slug'],
//     filters: {
//       slug: { $eq: id },
//     },
//     populate: [
//       'faqAnswerGroups',
//       'faqAnswerGroups.faqDefaultAnswer',
//       'faqAnswerGroups.faqAnswers',
//     ],
//   })

//   return schema.parse(data)
// }
