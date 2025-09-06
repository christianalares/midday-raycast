import { Action, ActionPanel, Alert, Color, confirmAlert, Icon, List, useNavigation } from '@raycast/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys, type QueryResults } from './api/queries'
import CreateCustomer from './create-customer'
import { withMiddayClient } from './lib/with-midday-client'
import TransactionsComponent from './transactions'
import { api } from './api'
import { useToggleState } from './hooks/use-toggle-state'
import { formatSize, getCountryByCode } from './lib/utils'
import EditCustomer from './edit-customer'

type Props = {
  selectedId?: string
}

const Search = ({ selectedId }: Props) => {
  const [showDetails, toggleShowDetails] = useToggleState()
  const [query, setQuery] = useState('')
  const { data, isLoading, error } = useQuery(queryKeys.globalSearch(query))

  const search = data ?? []

  const vaultResults = search.filter((result) => result.type === 'vault')
  const customerResults = search.filter((result) => result.type === 'customer')
  const invoicesResults = search.filter((result) => result.type === 'invoice')
  const transactionResults = search.filter((result) => result.type === 'transaction')
  const inboxResults = search.filter((result) => result.type === 'inbox')

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search transactions"
      onSearchTextChange={setQuery}
      throttle={true}
      selectedItemId={selectedId}
      isShowingDetail={showDetails}
    >
      {error && (
        <List.EmptyView
          title={error.message}
          description="Please try again"
          icon={{ source: Icon.Warning, tintColor: Color.Red }}
        />
      )}

      {!error && search.length === 0 && (
        <List.EmptyView title="No search results found!" icon={{ source: Icon.Warning, tintColor: Color.Orange }} />
      )}

      <VaultList results={vaultResults} showDetails={showDetails} toggleShowDetails={toggleShowDetails} />
      <CustomersList results={customerResults} showDetails={showDetails} toggleShowDetails={toggleShowDetails} />
      <InvoicesList results={invoicesResults} />
      <TransactionsList results={transactionResults} />
      {/* TODO: Add tracker */}
      <InboxList results={inboxResults} />
    </List>
  )
}

type ResultItem = QueryResults['globalSearch'][number]
type ListResultsByType<T extends ResultItem['type']> = Array<Extract<ResultItem, { type: T }>>

// LISTS

const VaultList = ({
  results,
  showDetails,
  toggleShowDetails,
}: {
  results: ListResultsByType<'vault'>
  showDetails: boolean
  toggleShowDetails: () => void
}) => {
  return (
    <List.Section title="Vault">
      {results.map((result) => (
        <List.Item
          key={result.id}
          id={result.id}
          title={result.data.path_tokens.at(-1) ?? ''}
          icon={Icon.Document}
          detail={<VaultDetail result={result} shouldFetch={showDetails} />}
          actions={
            <ActionPanel>
              <Action
                title={showDetails ? 'Hide Details' : 'Show Details'}
                onAction={toggleShowDetails}
                icon={showDetails ? Icon.EyeDisabled : Icon.Eye}
              />

              <Action.OpenInBrowser
                url={`https://app.midday.ai/vault?documentId=${result.id}`}
                title="View document on Midday"
              />
            </ActionPanel>
          }
        />
      ))}

      <List.Item
        title="View vault"
        id="view-vault"
        icon={{
          source: Icon.ArrowNe,
          tintColor: Color.SecondaryText,
        }}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser url="https://app.midday.ai/vault" title="View vault on Midday" />
          </ActionPanel>
        }
      />
    </List.Section>
  )
}

const CustomersList = ({
  results,
  showDetails,
  toggleShowDetails,
}: {
  results: ListResultsByType<'customer'>
  showDetails: boolean
  toggleShowDetails: () => void
}) => {
  const navigation = useNavigation()
  const queryClient = useQueryClient()

  const deleteCustomerMutation = useMutation({
    mutationFn: api.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globalSearch().queryKey })
    },
    meta: {
      toastTitle: {
        loading: 'Deleting customer...',
        success: '✅ Customer deleted',
        error: '❌ Failed to delete customer',
      },
    },
  })

  return (
    <List.Section title="Customers">
      {results.map((result) => (
        <List.Item
          key={result.id}
          id={result.id}
          title={result.data.name}
          icon={Icon.Person}
          accessories={[
            {
              text: result.data.email,
            },
          ]}
          detail={<CustomerDetail shouldFetch={showDetails} result={result} />}
          actions={
            <ActionPanel>
              <Action
                title={showDetails ? 'Hide Details' : 'Show Details'}
                onAction={toggleShowDetails}
                icon={showDetails ? Icon.EyeDisabled : Icon.Eye}
              />

              <ActionPanel.Section>
                <Action
                  title="Edit customer"
                  icon={Icon.Pencil}
                  onAction={() => navigation.push(<EditCustomer customerId={result.id} />)}
                  shortcut={{ modifiers: ['cmd'], key: 'e' }}
                />

                <Action
                  title="Delete customer"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ['ctrl'], key: 'x' }}
                  onAction={async () => {
                    const isConfirmed = await confirmAlert({
                      title: 'Are you sure you want to delete this customer?',
                      message: 'This action cannot be undone.',
                      primaryAction: {
                        title: 'Delete',
                        style: Alert.ActionStyle.Destructive,
                      },
                    })

                    if (!isConfirmed) {
                      return
                    }

                    deleteCustomerMutation.mutate(result.id)
                  }}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}

      <List.Item
        title="Create customer"
        icon={{
          source: Icon.PlusCircle,
          tintColor: Color.SecondaryText,
        }}
        actions={
          <ActionPanel>
            <Action.Push title="Create Customer" target={<CreateCustomer />} />
          </ActionPanel>
        }
      />
      <List.Item
        title="View customers"
        id="view-customers"
        icon={{
          source: Icon.ArrowNe,
          tintColor: Color.SecondaryText,
        }}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser url="https://app.midday.ai/customers" title="View customers on Midday" />
          </ActionPanel>
        }
      />
    </List.Section>
  )
}

const InvoicesList = ({ results }: { results: ListResultsByType<'invoice'> }) => {
  return (
    <List.Section title="Invoices">
      {results.map((result) => (
        <List.Item key={result.id} id={result.id} title={result.data.customer_name} icon={Icon.Document} />
      ))}

      {/* TODO: Add create invoice */}
      {/* <List.Item title="Create invoice" icon={Icon.ArrowNe} /> */}

      <List.Item
        title="View invoices"
        id="view-invoices"
        icon={{
          source: Icon.ArrowNe,
          tintColor: Color.SecondaryText,
        }}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser url="https://app.midday.ai/invoices" title="View invoices on Midday" />
          </ActionPanel>
        }
      />
    </List.Section>
  )
}

const TransactionsList = ({ results }: { results: ListResultsByType<'transaction'> }) => {
  return (
    <List.Section title="Transactions">
      {results.map((result) => (
        <List.Item key={result.id} id={result.id} title={result.data.name} icon={Icon.List} />
      ))}

      {/*  */}
      {/* <List.Item title="Create transaction" icon={Icon.ArrowNe} /> */}
      <List.Item
        title="View transactions"
        id="view-transactions"
        icon={{
          source: Icon.ArrowRight,
          tintColor: Color.SecondaryText,
        }}
        actions={
          <ActionPanel>
            <Action.Push title="View Transactions" target={<TransactionsComponent />} />
          </ActionPanel>
        }
      />
    </List.Section>
  )
}

const InboxList = ({ results }: { results: ListResultsByType<'inbox'> }) => {
  return (
    <List.Section title="Inbox">
      {results.map((result) => (
        <List.Item key={result.id} id={result.id} title={result.data.file_name} icon={Icon.Document} />
      ))}

      <List.Item
        title="View inbox"
        id="view-inbox"
        icon={Icon.ArrowNe}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser url="https://app.midday.ai/inbox" title="View inbox on Midday" />
          </ActionPanel>
        }
      />
    </List.Section>
  )
}

// DETAILS

const VaultDetail = ({ result, shouldFetch }: { result: ListResultsByType<'vault'>[number]; shouldFetch: boolean }) => {
  const { data: document, isLoading } = useQuery({
    ...queryKeys.documents.getById(result.id),
    enabled: shouldFetch,
  })

  if (!document) {
    return null
  }

  const getProcessingStatus = (): { text: string; color: Color } => {
    // 'pending' | 'processing' | 'completed' | 'failed'
    switch (document.processingStatus) {
      case 'pending':
        return { text: 'Pending', color: Color.Orange }
      case 'processing':
        return { text: 'Processing', color: Color.Yellow }
      case 'completed':
        return { text: 'Completed', color: Color.Green }
      case 'failed':
        return { text: 'Failed', color: Color.Red }
      default:
        return { text: 'Unknown', color: Color.PrimaryText }
    }
  }

  const processingStatus = getProcessingStatus()

  return (
    <List.Item.Detail
      isLoading={isLoading}
      markdown={document.summary ?? null}
      metadata={
        <List.Item.Detail.Metadata>
          {!document.summary && document.title && (
            <List.Item.Detail.Metadata.Label title="Title" text={document.title} />
          )}
          <List.Item.Detail.Metadata.Label title="Filename" text={document.pathTokens.at(-1)} />
          {document.metadata?.mimetype && (
            <List.Item.Detail.Metadata.Label title="Mime Type" text={document.metadata.mimetype} />
          )}
          {document.metadata?.size && (
            <List.Item.Detail.Metadata.Label title="Size" text={formatSize(document.metadata.size)} />
          )}

          <List.Item.Detail.Metadata.Label
            title="Processing Status"
            text={{
              value: processingStatus.text,
              color: processingStatus.color,
            }}
          />
        </List.Item.Detail.Metadata>
      }
    />
  )
}

const CustomerDetail = ({
  result,
  shouldFetch,
}: {
  result: ListResultsByType<'customer'>[number]
  shouldFetch: boolean
}) => {
  const { data: customer, isLoading } = useQuery({
    ...queryKeys.customers.getById(result.id),
    enabled: shouldFetch,
  })

  if (!customer) {
    return null
  }

  const customerCountry = customer.country ? getCountryByCode(customer.country) : null

  return (
    <List.Item.Detail
      isLoading={isLoading}
      markdown={isLoading ? 'Loading...' : null}
      metadata={
        isLoading ? null : (
          <List.Item.Detail.Metadata>
            <List.Item.Detail.Metadata.Label title="Name" text={customer.name} />
            <List.Item.Detail.Metadata.Label title="Email" text={customer.email} />
            {customer.billingEmail && (
              <List.Item.Detail.Metadata.Label title="Billing Email" text={customer.billingEmail} />
            )}

            {customer.phone && <List.Item.Detail.Metadata.Label title="Phone" text={customer.phone} />}
            {customer.website && <List.Item.Detail.Metadata.Label title="Website" text={customer.website} />}
            {customer.contact && <List.Item.Detail.Metadata.Label title="Contact" text={customer.contact} />}

            <List.Item.Detail.Metadata.Separator />

            {customer.addressLine1 && (
              <List.Item.Detail.Metadata.Label title="Address Line 1" text={customer.addressLine1} />
            )}
            {customer.addressLine2 && (
              <List.Item.Detail.Metadata.Label title="Address Line 2" text={customer.addressLine2} />
            )}
            {customerCountry && (
              <List.Item.Detail.Metadata.Label
                title="Country"
                text={`${customerCountry.emoji} ${customerCountry.name}`}
              />
            )}
            {customer.city && <List.Item.Detail.Metadata.Label title="City" text={customer.city} />}
            {customer.state && <List.Item.Detail.Metadata.Label title="State / Province" text={customer.state} />}
            {customer.zip && <List.Item.Detail.Metadata.Label title="ZIP Code / Postal Code" text={customer.zip} />}

            <List.Item.Detail.Metadata.Separator />

            {customer.vatNumber && (
              <List.Item.Detail.Metadata.Label title="Tax ID / VAT Number" text={customer.vatNumber} />
            )}
            {customer.note && <List.Item.Detail.Metadata.Label title="Note" text={customer.note} />}
          </List.Item.Detail.Metadata>
        )
      }
    />
  )
}

export default withMiddayClient(Search)
