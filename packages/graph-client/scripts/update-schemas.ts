import { BONDS_SUBGRAPH_URL } from '@sushiswap/bonds-sdk'
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql'

import fs from 'fs'

const schemas = {
  bonds: BONDS_SUBGRAPH_URL[1],
  bentobox: 'api.studio.thegraph.com/query/32073/bentobox-ethereum/v0.0.1',
  strapi: 'sushi-strapi-cms.herokuapp.com/graphql',
  furo: 'api.studio.thegraph.com/query/32073/furo-ethereum/v0.0.1',
  'data-api': 'data-api-production-acb1.up.railway.app/graphql',
} as const satisfies Record<string, string>

async function updateSchema(schema: keyof typeof schemas) {
  const path = `./src/subgraphs/${schema}/schema.graphql`
  const url = schemas[schema]

  try {
    const res = await fetch(`https://${url}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://sushi.com',
      },
      body: JSON.stringify({
        query: getIntrospectionQuery(),
      }),
    })

    const content = printSchema(buildClientSchema((await res.json()).data))

    fs.mkdirSync(`./src/subgraphs/${schema}`, { recursive: true })

    fs.writeFileSync(path, content)
  } catch (e) {
    return {
      schema,
      success: false,
      error: e,
    }
  }

  return {
    schema,
    success: true,
  }
}

const res = await Promise.all(
  Object.keys(schemas).map((schema) =>
    updateSchema(schema as keyof typeof schemas),
  ),
)

if (fs.statSync('./schema.graphql', { throwIfNoEntry: false })) {
  fs.rmSync('./schema.graphql')
}

res.forEach((r) => {
  if (r.success) {
    console.log(`Updated ${r.schema} schema`)
  } else {
    console.error(`Failed to update ${r.schema} schema`, r.error)
  }
})
