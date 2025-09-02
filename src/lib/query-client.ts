import { QueryClient } from "@tanstack/react-query";

// Singleton QueryClient instance shared across all Raycast commands
// This ensures cache persistence when switching between different views
let queryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 30, // Cache the data for 30 seconds
          gcTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
          retry: 3,
          refetchOnWindowFocus: false, // Prevent background refetching in Raycast environment
        },
        mutations: {
          retry: 1, // Retry failed mutations once
        },
      },
    });
  }

  return queryClient;
}

// Function to clear the cache if needed
export function clearQueryCache() {
  if (queryClient) {
    queryClient.clear();
  }
}
