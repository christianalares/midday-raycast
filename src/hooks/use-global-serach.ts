import { useCachedPromise } from "@raycast/utils";
import { globalSearch } from "../api";

export const useGlobalSearch = (query?: string) => {
  const { data, isLoading, error } = useCachedPromise(
    async (_query?: string) => {
      const search = await globalSearch(_query);

      return search;
    },
    [query],
    {
      keepPreviousData: true,
      failureToastOptions: {
        title: "❗ Failed to fetch search",
      },
    },
  );

  return {
    search: data ?? [],
    isLoading: (!data && !error) || isLoading,
    error,
  };
};
