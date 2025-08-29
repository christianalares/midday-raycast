import { useCachedPromise } from '@raycast/utils'
import { getTransactions } from '../api'

export const useTransactions = (query?: string) => {
  const { data, isLoading, error } = useCachedPromise(
    async (_query?: string) => {
      const transactions = await getTransactions(query)

      return transactions
    },
    [query],
    {
      keepPreviousData: true,
      failureToastOptions: {
        title: '❗ Failed to fetch transactions',
      },
    }
  )

  return {
    transations: data ?? [],
    isLoading: (!data && !error) || isLoading,
    error,
  }
}
