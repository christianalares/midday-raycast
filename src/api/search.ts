import { tryCatch, type Prettify } from '../lib/utils'
import { getGlobalToken, getMiddayClient } from './oauth'

type SearchResultItem = Awaited<ReturnType<ReturnType<typeof getMiddayClient>['search']['search']>>[number]
type SearchResults = Array<
  Prettify<
    Omit<SearchResultItem, 'data'> &
      (
        | {
            type: 'vault'
            data: {
              tag: string | null
              name: string
              title: string
              summary: string
              metadata: {
                eTag: string
                size: number
                mimeType: string
              }
              object_id: string
              path_tokens: string[]
              doc_language: string
            }
          }
        | {
            type: 'transaction'
            data: {
              date: string | null
              name: string
              amount: number
              method: string
              category: string | null
              currency: string
            }
          }
        | {
            type: 'inbox'
            data: {
              date: string | null
              file_name: string
            }
          }
        | {
            type: 'customer'
            data: {
              name: string
              email: string
            }
          }
        | {
            type: 'invoice'
            data: {
              amount: number
              status: string
              currency: string
              due_date: string
              customer_name: string
              invoice_number: string
            }
          }
      )
  >
>

// TODO: Use the Midday SDK for global search when the validation schema is fixed
const globalSearch = async (query?: string) => {
  const token = getGlobalToken()

  const res = await tryCatch(
    fetch(`https://api.midday.ai/search?searchTerm=${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  )

  const search = (await res.json()) as SearchResults

  return search

  // const midday = getMiddayClient()

  // const search = await tryCatch(midday.search.search({ searchTerm: query }))

  // return search
}

export const search = {
  global: globalSearch,
}
