import { queryOptions, type QueryOptions } from '@tanstack/react-query'
import {
  api,
  type GetPreSignedTransactionAttachmentUrlArgs,
  type GetTrackerEntriesArgs,
  type GetTransactionsArgs,
  type GetDocumentsArgs,
} from '.'

export const queryKeys = {
  globalSearch: (q?: string) => {
    return queryOptions({
      queryKey: ['global-search', q],
      queryFn: () => api.globalSearch(q),
    })
  },
  documents: {
    list: (args: GetDocumentsArgs) => {
      return queryOptions({
        queryKey: ['documents', args],
        queryFn: () => api.getDocuments(args),
      })
    },
    getById: (id: string) => {
      return queryOptions({
        queryKey: ['documents', id],
        queryFn: () => api.getDocumentById(id),
      })
    },
  },
  spendings: {
    list: ({ from, to }: { from: Date; to: Date }) => {
      return queryOptions({
        queryKey: ['spendings', { from, to }],
        queryFn: () => api.getSpendings({ from, to }),
      })
    },
  },
  trackerProjects: {
    list: () => {
      return queryOptions({
        queryKey: ['tracker-projects'],
        queryFn: () => api.getTrackerProjects(),
      })
    },
  },
  trackerEntries: {
    getByProjectId: (args: GetTrackerEntriesArgs) => {
      return queryOptions({
        queryKey: ['tracker-entries', args],
        queryFn: () => api.getTrackerEntries(args),
      })
    },
  },
  trackerTimer: {
    status: () => {
      return queryOptions({
        queryKey: ['tracker-timer', 'status'],
        queryFn: () => api.getTimerStatus(),
      })
    },
  },
  transactions: {
    list: (args: GetTransactionsArgs) => {
      return queryOptions({
        queryKey: ['transactions', args],
        queryFn: () => api.getTransactions(args),
      })
    },
    getById: (id: string) => {
      return queryOptions({
        queryKey: ['transactions', id],
        queryFn: () => api.getTransactionById(id),
      })
    },
    getAttachmentPreSignedUrl: (args: GetPreSignedTransactionAttachmentUrlArgs) => {
      return queryOptions({
        queryKey: ['transactions', args.transactionId, 'pre-signed-attachment-url', args.attachmentId],
        queryFn: () => api.getPreSignedTransactionAttachmentUrl(args),
      })
    },
  },
  customers: {
    getById: (id: string) => {
      return queryOptions({
        queryKey: ['customers', id],
        queryFn: () => api.getCustomer(id),
      })
    },
  },
}

export type QueryResults<T = typeof queryKeys> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R
    ? R extends QueryOptions<infer TData, any, any, any>
      ? TData
      : never
    : QueryResults<T[K]>
}
