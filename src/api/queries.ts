import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { api } from ".";

export const queryKeys = createQueryKeyStore({
  globalSearch: {
    list: (q?: string) => ({
      queryKey: [q],
      queryFn: () => api.globalSearch(q),
    }),
  },
  spendings: {
    list: ({ from, to }: { from: Date; to: Date }) => ({
      queryKey: [{ from, to }],
      queryFn: () => api.getSpendings({ from, to }),
    }),
  },
  trackerProjects: {
    list: () => ({
      queryKey: ["tracker-projects"],
      queryFn: () => api.getTrackerProjects(),
    }),
  },
  transactions: {
    list: (q?: string) => ({
      queryKey: [q],
      queryFn: () => api.getTransactions(q),
    }),
  },
  customers: {
    get: (id: string) => ({
      queryKey: [id],
      queryFn: () => api.getCustomer(id),
    }),
  },
});

// Type helper to infer the return type of a query function from query key factory structure
type InferQueryResult<T> = T extends (...args: any[]) => infer TReturn
  ? TReturn extends { queryFn?: infer TFn }
    ? TFn extends (...args: any[]) => any
      ? Awaited<ReturnType<TFn>>
      : never
    : never
  : T extends { queryFn?: infer TFn }
    ? TFn extends (...args: any[]) => any
      ? Awaited<ReturnType<TFn>>
      : never
    : never;

// Type helper to create QueryResults type from the entire query key store
type InferQueryKeyStoreResults<T> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? {
        [P in keyof T[K] as P extends "_def" ? never : P]: InferQueryResult<T[K][P]>;
      }
    : InferQueryResult<T[K]>;
};

export type QueryResults = InferQueryKeyStoreResults<typeof queryKeys>;
