import { queryOptions, type QueryOptions } from '@tanstack/react-query'
import { api } from '.'
import type { GetDocumentsArgs } from './documents'
import type { GetTrackerEntriesArgs } from './tracker'
import type { GetTransactionsArgs } from './transactions'
import type { GetPreSignedTransactionAttachmentUrlArgs } from './transactions'
import type { GetInvoicesArgs } from './invoices'

export const queryKeys = {
  globalSearch: (q?: string) => {
    return queryOptions({
      queryKey: ['global-search', q],
      queryFn: () => api.search.global(q),
    })
  },
  documents: {
    list: (args: GetDocumentsArgs) => {
      return queryOptions({
        queryKey: ['documents', args],
        queryFn: () => api.documents.get(args),
      })
    },
    getById: (id: string) => {
      return queryOptions({
        queryKey: ['documents', id],
        queryFn: () => api.documents.getById(id),
      })
    },
  },
  spendings: {
    list: ({ from, to }: { from: Date; to: Date }) => {
      return queryOptions({
        queryKey: ['spendings', { from, to }],
        queryFn: () => api.reports.getSpendings({ from, to }),
      })
    },
  },
  trackerProjects: {
    list: () => {
      return queryOptions({
        queryKey: ['tracker-projects'],
        queryFn: () => api.tracker.projects.get(),
      })
    },
  },
  trackerEntries: {
    getByProjectId: (args: GetTrackerEntriesArgs) => {
      return queryOptions({
        queryKey: ['tracker-entries', args],
        queryFn: () => api.tracker.entries.get(args),
      })
    },
  },
  trackerTimer: {
    status: () => {
      return queryOptions({
        queryKey: ['tracker-timer', 'status'],
        queryFn: () => api.tracker.timer.getStatus(),
      })
    },
  },
  transactions: {
    list: (args: GetTransactionsArgs) => {
      return queryOptions({
        queryKey: ['transactions', args],
        queryFn: () => api.transactions.get(args),
      })
    },
    getById: (id: string) => {
      return queryOptions({
        queryKey: ['transactions', id],
        queryFn: () => api.transactions.getById(id),
      })
    },
    getAttachmentPreSignedUrl: (args: GetPreSignedTransactionAttachmentUrlArgs) => {
      return queryOptions({
        queryKey: ['transactions', args.transactionId, 'pre-signed-attachment-url', args.attachmentId],
        queryFn: () => api.transactions.getPreSignedAttachmentUrl(args),
      })
    },
  },
  customers: {
    list: () => {
      return queryOptions({
        queryKey: ['customers'],
        queryFn: () => api.customers.list(),
      })
    },
    getById: (id: string) => {
      return queryOptions({
        queryKey: ['customers', id],
        queryFn: () => api.customers.getById(id),
      })
    },
  },
  invoices: {
    list: (args: GetInvoicesArgs) => {
      return queryOptions({
        queryKey: ['invoices', args],
        queryFn: () => api.invoices.list(args),
      })
    },
    getById: (id: string) => {
      return queryOptions({
        queryKey: ['invoices', id],
        queryFn: () => api.invoices.getById(id),
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
