import { api, type GetDocumentsArgs } from '.'
import { queryOptions, type QueryOptions } from '@tanstack/react-query'

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
  transactions: {
    list: (q?: string) => {
      return queryOptions({
        queryKey: ['transactions', q],
        queryFn: () => api.getTransactions(q),
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
