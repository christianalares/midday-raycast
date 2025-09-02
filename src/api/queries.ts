import { queryOptions } from "@tanstack/react-query";
import { getSpendings, getTrackerProjects, getTransactions, globalSearch } from ".";

export type InferQueryOptionsData<TOptions> = TOptions extends (...args: any) => infer TReturn
  ? TReturn extends { queryFn?: infer TFn }
    ? TFn extends (...args: any) => any
      ? Awaited<ReturnType<TFn>>
      : never
    : never
  : TOptions extends { queryFn?: infer TFn }
    ? TFn extends (...args: any) => any
      ? Awaited<ReturnType<TFn>>
      : never
    : never;

export namespace QueryResults {
  export type GlobalSearch = InferQueryOptionsData<typeof getGlobalSearchQueryOptions>;
  export type Spendings = InferQueryOptionsData<typeof getSpendingsQueryOptions>;
  export type TrackerProjects = InferQueryOptionsData<typeof getTrackerProjectsQueryOptions>;
}

const getGlobalSearchQueryOptions = (q?: string) => {
  return queryOptions({
    queryKey: ["global-search", q],
    queryFn: () => globalSearch(q),
  });
};

const getSpendingsQueryOptions = ({ from, to }: { from: Date; to: Date }) => {
  return queryOptions({
    queryKey: ["spendings"],
    queryFn: () => getSpendings({ from, to }),
  });
};

const getTrackerProjectsQueryOptions = () => {
  return queryOptions({
    queryKey: ["tracker-projects"],
    queryFn: getTrackerProjects,
  });
};

const getTransactionsQueryOptions = (q?: string) => {
  return queryOptions({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(q),
  });
};

export const getQueryOptions = {
  globalSearch: getGlobalSearchQueryOptions,
  spendings: getSpendingsQueryOptions,
  trackerProjects: getTrackerProjectsQueryOptions,
  transactions: getTransactionsQueryOptions,
};
