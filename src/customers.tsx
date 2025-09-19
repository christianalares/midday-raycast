import { Action, ActionPanel, Icon, Image, List } from '@raycast/api'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './api/queries'
import { useToggleState } from './hooks/use-toggle-state'
import { getCountryEmojiByCountryName } from './lib/countries'
import { getCustomerWebsite } from './lib/utils'
import { withMiddayClient } from './lib/with-midday-client'

const Customers = () => {
  const [showDetails, toggleShowDetails] = useToggleState()
  const { data: customersData, isLoading } = useQuery(queryKeys.customers.list())

  const customers = customersData ?? []

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search customers" isShowingDetail={showDetails}>
      {customers.map((customer) => {
        return (
          <List.Item
            key={customer.id}
            title={customer.name}
            subtitle={customer.email}
            icon={{
              source: getCustomerWebsite({ website: customer.website, name: customer.name }),
              mask: Image.Mask.Circle,
            }}
            accessories={[
              {
                tooltip: `${customer.invoiceCount} invoices created`,
                // icon: Icon.Document,
                text: customer.invoiceCount.toString(),
              },
            ]}
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Name" text={customer.name} />
                    {customer.contact && (
                      <List.Item.Detail.Metadata.Label title="Contact person" text={customer.contact} />
                    )}
                    <List.Item.Detail.Metadata.Label title="Email" text={customer.email} />
                    {customer.website && <List.Item.Detail.Metadata.Label title="Website" text={customer.website} />}

                    <List.Item.Detail.Metadata.Separator />

                    <List.Item.Detail.Metadata.Label title="Invoices" text={customer.invoiceCount.toString()} />

                    <List.Item.Detail.Metadata.Separator />

                    {customer.addressLine1 && (
                      <List.Item.Detail.Metadata.Label title="Address Line 1" text={customer.addressLine1} />
                    )}
                    {customer.addressLine2 && (
                      <List.Item.Detail.Metadata.Label title="Address Line 2" text={customer.addressLine2} />
                    )}
                    {customer.country && (
                      <List.Item.Detail.Metadata.Label
                        title="Country"
                        text={customer.country}
                        icon={getCountryEmojiByCountryName(customer.country)}
                      />
                    )}
                    {customer.city && <List.Item.Detail.Metadata.Label title="City" text={customer.city} />}
                    {customer.state && (
                      <List.Item.Detail.Metadata.Label title="State / Province" text={customer.state} />
                    )}
                    {customer.zip && (
                      <List.Item.Detail.Metadata.Label title="ZIP Code / Postal Code" text={customer.zip} />
                    )}
                    {customer.vatNumber && (
                      <List.Item.Detail.Metadata.Label title="Tax ID / VAT Number" text={customer.vatNumber} />
                    )}

                    {customer.note && (
                      <>
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label title="Note" text={customer.note} />
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
        )
      })}
    </List>
  )
}

export default withMiddayClient(Customers)
