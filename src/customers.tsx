import { Action, ActionPanel, Icon, Image, List } from '@raycast/api'
import { useQuery } from '@tanstack/react-query'
import { queryKeys, QueryResults } from './api/queries'
import { useToggleState } from './hooks/use-toggle-state'
import { getCountryEmojiByCountryName } from './lib/countries'
import { getWebsiteLogo } from './lib/utils'
import { withMiddayClient } from './lib/with-midday-client'

const getCustomerWebsite = (customer: QueryResults['customers']['list'][number]) => {
  if (!customer.website || customer.website.trim() === '') {
    // This constructs a website format based on the customer name
    // which will generate a logo with the letter of the customer name
    return getWebsiteLogo(`${customer.name.replace(/ /g, '').toLowerCase()}.com`)
  }

  return getWebsiteLogo(customer.website)
}

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
            icon={{
              source: getCustomerWebsite(customer),
              mask: Image.Mask.Circle,
            }}
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
