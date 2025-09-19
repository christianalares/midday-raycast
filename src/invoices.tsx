import { Action, ActionPanel, Color, Icon, Image, List } from '@raycast/api'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys, QueryResults } from './api/queries'
import { useToggleState } from './hooks/use-toggle-state'
import { formatCurrency, getCustomerWebsite } from './lib/utils'
import { withMiddayClient } from './lib/with-midday-client'

type InvoiceStatus = Record<
  QueryResults['invoices']['list'][number]['status'],
  {
    color: Color.ColorLike
    label: string
  }
>

const formatActivityDate = (dateStr: string | null) => {
  if (!dateStr) {
    return undefined
  }

  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
}

const INVOICE_STATUS: InvoiceStatus = {
  canceled: {
    label: 'Canceled',
    color: '#878787',
  },
  draft: {
    label: 'Draft',
    color: '#878787',
  },
  overdue: {
    label: 'Overdue',
    color: '#ffd02b',
  },
  paid: {
    label: 'Paid',
    color: '#00c969',
  },
  unpaid: {
    label: 'Unpaid',
    color: '#1d1d1d',
  },
  scheduled: {
    label: 'Scheduled',
    color: '#1f6feb',
  },
}

const Invoices = () => {
  const [showDetails, toggleShowDetails] = useToggleState()
  const [query, setQuery] = useState('')
  const { data, isLoading } = useQuery(queryKeys.invoices.list({ q: query }))

  const invoices = data ?? []

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search invoices"
      onSearchTextChange={setQuery}
      throttle={true}
      isShowingDetail={showDetails}
    >
      {invoices.length === 0 ? (
        <List.EmptyView title="Invoices" description="You don't have any created invoices" icon={Icon.Document} />
      ) : (
        invoices.map((invoice) => (
          <List.Item
            keywords={[
              invoice.invoiceNumber?.toString() ?? '',
              invoice.invoiceNumber?.toString().replace('INV-', '') ?? '',
            ]}
            key={invoice.id}
            title={invoice.customer.name}
            icon={{
              source: getCustomerWebsite({ website: invoice.customer.website, name: invoice.customer.name }),
              mask: Image.Mask.Circle,
            }}
            subtitle={invoice.invoiceNumber}
            accessories={[
              {
                tag: {
                  value: INVOICE_STATUS[invoice.status].label,
                  color: INVOICE_STATUS[invoice.status].color,
                },
              },
              {
                text: formatCurrency(invoice.amount, invoice.currency),
              },
            ]}
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    {invoice.invoiceNumber && (
                      <>
                        <List.Item.Detail.Metadata.Link
                          title="Invoice no."
                          text={invoice.invoiceNumber}
                          target={`https://app.midday.ai/invoices?invoiceId=${invoice.id}&type=details`}
                        />
                        <List.Item.Detail.Metadata.Separator />
                      </>
                    )}

                    <List.Item.Detail.Metadata.Label
                      title="Amount"
                      text={formatCurrency(invoice.amount, invoice.currency)}
                    />

                    {!!invoice.vat && invoice.vat > 0 && (
                      <>
                        <List.Item.Detail.Metadata.Label
                          title="VAT"
                          text={`${(invoice.vat / (invoice.amount - invoice.vat)) * 100}% (${formatCurrency(invoice.vat, invoice.currency)})`}
                        />
                        <List.Item.Detail.Metadata.Label
                          title="Excl. VAT"
                          text={formatCurrency(invoice.amount - invoice.vat, invoice.currency)}
                        />
                      </>
                    )}

                    <List.Item.Detail.Metadata.Separator />

                    <List.Item.Detail.Metadata.Label
                      title="Due date"
                      text={new Date(invoice.dueDate).toLocaleDateString()}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Issue date"
                      text={new Date(invoice.issueDate).toLocaleDateString()}
                    />
                    {invoice.sentAt && (
                      <List.Item.Detail.Metadata.Label
                        title="Sent at"
                        text={new Date(invoice.sentAt).toLocaleDateString()}
                      />
                    )}

                    <List.Item.Detail.Metadata.Separator />

                    <List.Item.Detail.Metadata.Label title="Activity" />

                    <ActivityItem label="Created" completed date={invoice.createdAt} />
                    {invoice.sentAt && <ActivityItem label="Sent" completed date={invoice.sentAt} />}
                    {/* TODO: Scheduled at */}
                    {invoice.viewedAt && <ActivityItem label="Viewed" completed date={invoice.viewedAt} />}
                    {invoice.reminderSentAt && (
                      <ActivityItem label="Reminder sent" completed date={invoice.reminderSentAt} />
                    )}
                    {invoice.status === 'paid' && (
                      <ActivityItem label="Paid" completed={invoice.paidAt !== null} date={invoice.paidAt} />
                    )}
                    {invoice.status === 'canceled' && <ActivityItem label="Canceled" completed date={invoice.paidAt} />}

                    {invoice.note && (
                      <>
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label title="Note" text={invoice.note} />
                      </>
                    )}
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                <Action
                  title={showDetails ? 'Hide Details' : 'Show Details'}
                  onAction={toggleShowDetails}
                  icon={showDetails ? Icon.EyeDisabled : Icon.Eye}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  )
}

type ActivityProps = {
  label: string
  date: string | null
  completed: boolean
}

const ActivityItem = ({ label, date, completed }: ActivityProps) => {
  const icon = completed ? '✓  ' : '○  '

  return <List.Item.Detail.Metadata.Label title={`${icon}${label}`} text={formatActivityDate(date)} />
}

export default withMiddayClient(Invoices)
