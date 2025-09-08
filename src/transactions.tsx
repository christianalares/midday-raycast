import { Action, ActionPanel, Color, Icon, List } from '@raycast/api'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys } from './api/queries'
import { formatCurrency } from './lib/utils'
import { withMiddayClient } from './lib/with-midday-client'
import { TransactionDetails } from './components/transaction-details'

function TransactionsComponent() {
  const [query, setQuery] = useState<string | undefined>(undefined)
  const { data, isLoading, error } = useQuery(queryKeys.transactions.list(query))

  const transactions = data ?? []

  const [showDetails, setShowDetails] = useState(false)

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search transactions"
      isShowingDetail={showDetails}
      onSearchTextChange={setQuery}
      throttle={true}
    >
      {error && (
        <List.EmptyView
          title={error.message}
          description="Please try again"
          icon={{ source: Icon.Warning, tintColor: Color.Red }}
        />
      )}

      {!error && transactions.length === 0 && (
        <List.EmptyView title="No transactions found!" icon={{ source: Icon.Warning, tintColor: Color.Orange }} />
      )}

      {transactions.map((tx) => {
        return (
          <List.Item
            key={tx.id}
            title={tx.name}
            accessories={[
              {
                text: {
                  value: formatCurrency(tx.amount, tx.currency),
                  color: tx.amount > 0 ? Color.Green : Color.PrimaryText,
                },
              },
              {
                date: new Date(tx.date),
              },
              {
                icon:
                  (tx.attachments ?? []).length > 0
                    ? { source: Icon.CheckCircle, tintColor: Color.Green }
                    : { source: Icon.Circle, tintColor: Color.Orange },
              },
            ]}
            detail={<TransactionDetails transactionId={tx.id} />}
            actions={
              <ActionPanel>
                <Action
                  title={showDetails ? 'Hide Details' : 'Show Details'}
                  onAction={() => setShowDetails(!showDetails)}
                  icon={showDetails ? Icon.EyeDisabled : Icon.Eye}
                />
                <Action.OpenInBrowser
                  title="View on Midday"
                  url={`https://app.midday.ai/transactions?transactionId=${tx.id}`}
                />

                {/* <ActionPanel.Section>
                  <Action.OpenInBrowser
                    title="View on Midday"
                    url={`https://app.midday.ai/transactions?transactionId=${tx.id}`}
                    shortcut={{ modifiers: ['cmd'], key: 'enter' }}
                  />
                </ActionPanel.Section> */}
              </ActionPanel>
            }
          />
        )
      })}
    </List>
  )
}

export default withMiddayClient(TransactionsComponent)
