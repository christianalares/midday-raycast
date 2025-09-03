import { showToast, Toast, captureException } from '@raycast/api'
import { QueryClient, MutationCache } from '@tanstack/react-query'
import '../types/query' // Import to register the meta types

// Singleton QueryClient instance shared across all Raycast commands
// This ensures cache persistence when switching between different views
let queryClient: QueryClient | null = null

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = new QueryClient({
      mutationCache: new MutationCache({
        onMutate: async (variables, mutation) => {
          const title = mutation.meta?.toastTitle?.loading || '⏳ Processing...'

          await showToast({
            style: Toast.Style.Animated,
            title,
          })
        },
        onSuccess: async (data, _variables, _context, mutation) => {
          const title = mutation.meta?.toastTitle?.success || '✅ Success'

          await showToast({
            style: Toast.Style.Success,
            title,
          })
        },
        onError: async (error, _variables, _context, mutation) => {
          const title = mutation.meta?.toastTitle?.error || '❌ Error'

          captureException(error)
          await showToast({
            style: Toast.Style.Failure,
            title,
          })
        },
      }),
      defaultOptions: {
        queries: {
          staleTime: 1000 * 30, // Cache the data for 30 seconds
          gcTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
          retry: 3,
          refetchOnWindowFocus: false, // Prevent background refetching in Raycast environment
        },
      },
    })
  }

  return queryClient
}

// Function to clear the cache if needed
export function clearQueryCache() {
  if (queryClient) {
    queryClient.clear()
  }
}
