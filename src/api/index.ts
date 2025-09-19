import { captureException } from '@raycast/api'
import { getGlobalToken, getMiddayClient } from './oauth'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * Wraps a promise with consistent error handling:
 * - Logs errors for debugging
 * - Captures errors for monitoring
 * - Re-throws errors for proper TanStack Query integration
 */
const tryCatch = async <T>(promise: Promise<T>): Promise<T> => {
  try {
    return await promise
  } catch (err) {
    console.error(err)
    captureException(err)
    throw err
  }
}

export type GetTransactionsArgs = NonNullable<Parameters<ReturnType<typeof getMiddayClient>['transactions']['list']>[0]>

const getTransactions = async (args: GetTransactionsArgs) => {
  const midday = getMiddayClient()

  const transactions = await tryCatch(
    midday.transactions.list({
      ...args,
    }),
  )

  return transactions.data
}

const getTransactionById = async (id: string) => {
  console.log('🔍 Getting transaction by id', id)
  const midday = getMiddayClient()

  const transaction = await tryCatch(midday.transactions.get({ id }))

  return transaction
}

const getSpendings = async ({ from, to }: { from: Date; to: Date }) => {
  const midday = getMiddayClient()

  const spendings = await tryCatch(
    midday.reports.spending({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    }),
  )

  return spendings
}

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

export type GetDocumentsArgs = NonNullable<Parameters<ReturnType<typeof getMiddayClient>['documents']['list']>[0]>

const getDocuments = async (args: GetDocumentsArgs) => {
  const midday = getMiddayClient()

  const documents = await tryCatch(midday.documents.list(args))

  return documents
}

const getDocumentById = async (id: string) => {
  const midday = getMiddayClient()

  const document = await tryCatch(midday.documents.get({ id }))

  return document
}

export type CreateCustomerArgs = NonNullable<Parameters<ReturnType<typeof getMiddayClient>['customers']['create']>[0]>

const createCustomer = async (args: CreateCustomerArgs) => {
  const midday = getMiddayClient()

  const createdCustomer = await tryCatch(midday.customers.create(args))

  return createdCustomer
}

const getCustomer = async (id: string) => {
  const midday = getMiddayClient()

  const customer = await tryCatch(midday.customers.get({ id }))

  return customer
}

const deleteCustomer = async (id: string) => {
  const midday = getMiddayClient()

  const deletedCustomer = await tryCatch(midday.customers.delete({ id }))

  return deletedCustomer
}

export type UpdateCustomerArgs = NonNullable<Parameters<ReturnType<typeof getMiddayClient>['customers']['update']>[0]>

const updateCustomer = async (args: UpdateCustomerArgs) => {
  const midday = getMiddayClient()

  const updatedCustomer = await tryCatch(midday.customers.update(args))

  return updatedCustomer
}

const getTimerStatus = async () => {
  const midday = getMiddayClient()

  const timerStatus = await tryCatch(midday.trackerTimer.getTimerStatus({}))

  return timerStatus
}

const getTrackerProjects = async () => {
  const midday = getMiddayClient()

  const trackerProjects = await tryCatch(midday.trackerProjects.list({}))

  const timer = await tryCatch(midday.trackerTimer.getTimerStatus({}))

  const trackerProjectsWithTimer = trackerProjects.data.map((project) => {
    return {
      ...project,
      timer: timer.data.currentEntry?.projectId === project.id ? timer.data : null,
    }
  })

  return trackerProjectsWithTimer
}

const startTrackerTimer = async (projectId: string) => {
  const midday = getMiddayClient()

  const startedTimer = await tryCatch(midday.trackerTimer.startTimer({ projectId }))

  return startedTimer.data
}

const stopTrackerTimer = async () => {
  const midday = getMiddayClient()

  const stoppedTimer = await tryCatch(midday.trackerTimer.stopTimer({}))

  return stoppedTimer.data
}

export type GetTrackerEntriesArgs = {
  from: Date
  to: Date
  projectId: string
}

const getTrackerEntries = async (args: GetTrackerEntriesArgs) => {
  const midday = getMiddayClient()

  const trackerEntries = await tryCatch(
    midday.trackerEntries.list({
      from: args.from.toISOString().split('T')[0],
      to: args.to.toISOString().split('T')[0],
      projectId: args.projectId,
    }),
  )

  return trackerEntries
}

export type CreateTrackerEntryArgs = NonNullable<
  Parameters<ReturnType<typeof getMiddayClient>['trackerEntries']['create']>[0]
>

const createTrackerEntry = async (args: Omit<CreateTrackerEntryArgs, 'dates' | 'assignedId' | 'duration'>) => {
  const midday = getMiddayClient()

  const createdTrackerEntry = await tryCatch(
    midday.trackerEntries.create({
      ...args,
      dates: [args.start.toISOString().split('T')[0]],
      duration: args.stop.getTime() / 1000 - args.start.getTime() / 1000,
    }),
  )

  return createdTrackerEntry
}

export type GetPreSignedTransactionAttachmentUrlArgs = NonNullable<
  Parameters<ReturnType<typeof getMiddayClient>['transactions']['getAttachmentPreSignedUrl']>[0]
>

const getPreSignedTransactionAttachmentUrl = async (
  args: Omit<GetPreSignedTransactionAttachmentUrlArgs, 'download'>,
) => {
  const midday = getMiddayClient()

  const preSignedTransactionAttachmentUrl = await tryCatch(
    midday.transactions.getAttachmentPreSignedUrl({
      ...args,
      download: false,
    }),
  )

  return preSignedTransactionAttachmentUrl
}

export const api = {
  getTransactions,
  getTransactionById,
  getSpendings,
  globalSearch,
  getCustomer,
  getDocuments,
  getDocumentById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getTrackerProjects,
  startTrackerTimer,
  stopTrackerTimer,
  getTrackerEntries,
  createTrackerEntry,
  getPreSignedTransactionAttachmentUrl,
  getTimerStatus,
}
