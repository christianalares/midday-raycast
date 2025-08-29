import { useCachedPromise } from "@raycast/utils";
import { getSpendings } from "../api";

export const useSpendings = ({ from, to }: { from: Date; to: Date }) => {
  const { data, isLoading, error } = useCachedPromise(
    async ({ _from, _to }: { _from: Date; _to: Date }) => {
      const spendings = await getSpendings({ from: _from, to: _to });

      return spendings;
    },
    [{ _from: from, _to: to }],
    {
      keepPreviousData: true,
      failureToastOptions: {
        title: "❗ Failed to fetch spendings",
      },
    },
  );

  return {
    spendings: data ?? [],
    isLoading: (!data && !error) || isLoading,
    error,
  };
};
