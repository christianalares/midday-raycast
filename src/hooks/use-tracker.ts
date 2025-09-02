import { useCachedPromise } from "@raycast/utils";
import { getTrackerProjects } from "../api";

export const useTrackerProjects = () => {
  const { data, isLoading, error } = useCachedPromise(
    async () => {
      const search = await getTrackerProjects();

      return search;
    },
    [],
    {
      keepPreviousData: true,
      failureToastOptions: {
        title: "❗ Failed to fetch tracker",
      },
    },
  );

  return {
    trackerProjects: data ?? [],
    isLoading: (!data && !error) || isLoading,
    error,
  };
};
