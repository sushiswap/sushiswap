import { z } from 'zod'

export const imageSchema = z
  .object({
    data: z.object({
      id: z.number(),
      attributes: z.object({
        name: z.string(),
        alternativeText: z
          .string()
          .nullable()
          .transform((value) => value ?? ''),
        caption: z
          .string()
          .nullable()
          .transform((value) => value ?? ''),
        width: z.number(),
        height: z.number(),
        formats: z.object({
          thumbnail: z.object({
            url: z.string(),
            width: z.number(),
            height: z.number(),
          }),
        }),
        mime: z.string(),
        url: z.string(),
        hash: z.string(),
        provider_metadata: z.object({ public_id: z.string() }),
      }),
    }),
  })
  .transform((data) => data.data.attributes)
