import { getMiddayClient } from "./oauth";

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

  // Set default date range if not provided (last 30 days)

  const spendings = await midday.metrics.spending({
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  });

  return spendings;
};
