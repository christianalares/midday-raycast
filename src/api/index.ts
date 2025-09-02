import { Country } from "../utils/countries";
import { getGlobalToken, getMiddayClient } from "./oauth";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export const getTransactions = async (query?: string) => {
  const midday = getMiddayClient();

  const transactions = await midday.transactions.list({
    pageSize: 100,
    q: query,
  });

  return transactions.data;
};

export const getSpendings = async ({ from, to }: { from: Date; to: Date }) => {
  const midday = getMiddayClient();

  const spendings = await midday.metrics.spending({
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  });

  return spendings;
};

type SearchResultItem = Awaited<ReturnType<ReturnType<typeof getMiddayClient>["search"]["search"]>>[number];
type SearchResults = Array<
  Prettify<
    Omit<SearchResultItem, "data"> &
      (
        | {
            type: "vault";
            data: {
              tag: string | null;
              name: string;
              title: string;
              summary: string;
              metadata: {
                eTag: string;
                size: number;
                mimeType: string;
              };
              object_id: string;
              path_tokens: string[];
              doc_language: string;
            };
          }
        | {
            type: "transaction";
            data: {
              date: string | null;
              name: string;
              amount: number;
              method: string;
              category: string | null;
              currency: string;
            };
          }
        | {
            type: "inbox";
            data: {
              date: string | null;
              file_name: string;
            };
          }
        | {
            type: "customer";
            data: {
              name: string;
              email: string;
            };
          }
        | {
            type: "invoice";
            data: {
              amount: number;
              status: string;
              currency: string;
              due_date: string;
              customer_name: string;
              invoice_number: string;
            };
          }
      )
  >
>;

export const globalSearch = async (query?: string) => {
  const token = getGlobalToken();

  const res = await fetch(`https://api.midday.ai/search?searchTerm=${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const search = (await res.json()) as SearchResults;

  return search;
};

export type CreateCustomerArgs = Omit<
  NonNullable<Parameters<ReturnType<typeof getMiddayClient>["customers"]["create"]>[0]>,
  "country"
> & { country: Country["code"] };

export const createCustomer = async (args: CreateCustomerArgs) => {
  const midday = getMiddayClient();

  const createdCustomer = await midday.customers.create(args);

  return createdCustomer;
};

export const getTrackerProjects = async () => {
  const midday = getMiddayClient();

  const trackerProjects = await midday.trackerProjects.list({});

  const timer = await midday.trackerTimer.getTimerStatus({});

  const trackerProjectsWithTimer = trackerProjects.data.map((project) => {
    return {
      ...project,
      timer: timer.data.currentEntry?.projectId === project.id ? timer.data : null,
    };
  });

  // console.log(trackerProjectsWithTimer);

  return trackerProjectsWithTimer;
};
