import { useCachedPromise } from "@raycast/utils";
import { getTrackerProjects } from "../api";

export const useTrackerProjects = () => {
  const { data, isLoading, error, revalidate } = useCachedPromise(
    async () => {
      console.log("Fetching tracker projects...");
      const search = await getTrackerProjects();
      console.log("Fetched tracker projects:", search.length, "projects");
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

  const enhancedRevalidate = () => {
    console.log("Enhanced revalidate called...");
    revalidate();
  };

  return {
    trackerProjects: data ?? [],
    isLoading: (!data && !error) || isLoading,
    error,
    revalidate: enhancedRevalidate,
  };
};
