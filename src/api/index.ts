import { getMiddayClient } from "./oauth";

export const getTransactions = async (query?: string) => {
  const midday = getMiddayClient();

  const transactions = await midday.transactions.list({
    pageSize: 100,
    q: query,
  });

  return transactions.data;
};
