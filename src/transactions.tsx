import { List, Action, ActionPanel, Icon } from '@raycast/api'
import { withAccessToken, getAccessToken } from '@raycast/utils'
import { useState, useEffect } from 'react'
import { Transaction } from './types'
import { Midday } from '@midday-ai/sdk'

// Using the same OAuth service from main.tsx
import { oauthService } from './main'

function TransactionsComponent() {
  const { token } = getAccessToken()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize Midday client with OAuth token
  const midday = new Midday({
    security: {
      oauth2: token,
    },
  })

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true)
        // Try to fetch real data from Midday API
        try {
          console.log('Attempting to fetch transactions from Midday API...')

          // Try different Midday API endpoints
          try {
            const bankAccounts = await midday.bankAccounts.list({})
            console.log('Bank accounts response:', bankAccounts)
          } catch (bankError) {
            console.log('Bank accounts API error:', bankError)
          }

          // Note: Transactions might be under a different endpoint
          // const transactionResult = await midday.transactions.list()
          // setTransactions(transactionResult.data || [])
        } catch (apiError) {
          console.log('Midday API error - using demo data:', apiError)
        }

        // Demo data for now (replace when we find working API endpoints)
        const mockTransactions: Transaction[] = [
          {
            id: 'txn_1',
            amount: -45.99,
            currency: 'USD',
            description: 'Coffee Shop Purchase',
            date: '2024-01-15',
            category: 'Food & Dining',
            merchant: 'Blue Bottle Coffee',
            account: 'Checking',
          },
          {
            id: 'txn_2',
            amount: 2500.0,
            currency: 'USD',
            description: 'Client Payment',
            date: '2024-01-14',
            category: 'Income',
            merchant: 'Acme Corp',
            account: 'Business Checking',
          },
        ]
        setTransactions(mockTransactions)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [token])

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search transactions...">
      {transactions.map(transaction => (
        <List.Item
          key={transaction.id}
          title={transaction.description}
          subtitle={transaction.merchant || transaction.category}
          accessories={[
            {
              text: `${transaction.amount > 0 ? '+' : ''}$${Math.abs(transaction.amount).toFixed(2)}`,
              icon: transaction.amount > 0 ? Icon.ArrowUp : Icon.ArrowDown,
            },
            { text: transaction.date },
          ]}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard title="Copy Transaction ID" content={transaction.id} />
              <Action.CopyToClipboard title="Copy Amount" content={transaction.amount.toString()} />
            </ActionPanel>
          }
        />
      ))}
      {transactions.length === 0 && !isLoading && (
        <List.EmptyView
          title="No transactions found"
          description="Your transactions will appear here once synced."
          icon={Icon.BankNote}
        />
      )}
    </List>
  )
}

export default withAccessToken(oauthService)(TransactionsComponent)
