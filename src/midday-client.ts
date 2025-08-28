import { Midday } from '@midday-ai/sdk'
import { getAccessToken } from '@raycast/utils'

/**
 * Get a configured Midday SDK client with the current access token
 * @returns Configured Midday client ready for API calls
 */
export function getMiddayClient(): Midday {
  const { token } = getAccessToken()

  return new Midday({
    security: {
      oauth2: token,
    },
    // Add any other Midday SDK configuration here
    serverURL: 'https://api.midday.ai', // Use when available
  })
}

/**
 * Example helper functions for common Midday API operations
 * Uncomment and use these when Midday's API endpoints are ready
 */

// export async function fetchTransactions() {
//   const midday = getMiddayClient()
//   try {
//     const result = await midday.transactions.list()
//     return result.data || []
//   } catch (error) {
//     console.error('Failed to fetch transactions:', error)
//     throw error
//   }
// }

// export async function fetchInvoices() {
//   const midday = getMiddayClient()
//   try {
//     const result = await midday.invoices.list()
//     return result.data || []
//   } catch (error) {
//     console.error('Failed to fetch invoices:', error)
//     throw error
//   }
// }

// export async function fetchAccount() {
//   const midday = getMiddayClient()
//   try {
//     const result = await midday.accounts.get()
//     return result.data
//   } catch (error) {
//     console.error('Failed to fetch account:', error)
//     throw error
//   }
// }
