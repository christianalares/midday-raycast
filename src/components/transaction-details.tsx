import { Color, Icon, List } from '@raycast/api'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../api/queries'
import { formatCurrency } from '../lib/utils'

type Props = {
  transactionId: string
}

export const TransactionDetails = ({ transactionId }: Props) => {
  const { data: transaction, isLoading } = useQuery(queryKeys.transactions.getById(transactionId))

  if (!transaction) {
    return null
  }

  return (
    <List.Item.Detail
      isLoading={isLoading}
      markdown={isLoading ? 'Loading...' : undefined}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Link
            title="View on Midday"
            text={`https://app.midday.ai/transactions?transactionId=${transaction.id}`}
            target={`https://app.midday.ai/transactions?transactionId=${transaction.id}`}
          />

          <List.Item.Detail.Metadata.Label
            title="Amount"
            text={{
              value: formatCurrency(transaction.amount, transaction.currency),
              color: transaction.amount > 0 ? Color.Green : Color.PrimaryText,
            }}
          />

          {transaction.category && (
            <>
              <List.Item.Detail.Metadata.Separator />

              <List.Item.Detail.Metadata.Label
                title="Category"
                text={transaction.category.name}
                icon={{ source: Icon.Tag, tintColor: transaction.category.color }}
              />
            </>
          )}

          {(transaction.attachments ?? []).length > 0 ? (
            <List.Item.Detail.Metadata.Label
              title="Status"
              text="Matched"
              icon={{ source: Icon.CheckCircle, tintColor: Color.Green }}
            />
          ) : (
            <List.Item.Detail.Metadata.Label
              title="Status"
              text="Unmatched"
              icon={{ source: Icon.Circle, tintColor: Color.Orange }}
            />
          )}

          {(transaction.attachments ?? []).length > 0 && (
            <List.Item.Detail.Metadata.TagList title="Attachments">
              {(transaction.attachments ?? []).map((attachment) => {
                if (!attachment.filename) {
                  return null
                }

                return <List.Item.Detail.Metadata.TagList.Item key={attachment.id} text={attachment.filename} />
              })}
            </List.Item.Detail.Metadata.TagList>
          )}

          {transaction.note && <List.Item.Detail.Metadata.Label title="Note" text={transaction.note} />}
        </List.Item.Detail.Metadata>
      }
    />
  )
}
