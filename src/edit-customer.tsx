import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { queryKeys } from './api/queries'
import { CustomerForm } from './components/forms/customer-form'
import { withMiddayClient } from './lib/with-midday-client'
import { Detail } from '@raycast/api'

type Props = {
  customerId: string
}

const EditCustomer = ({ customerId }: Props) => {
  const { data: customer, isLoading, error } = useQuery(queryKeys.customers.getById(customerId))

  const queryClient = useQueryClient()

  const editCustomerMutation = useMutation({
    mutationFn: api.updateCustomer,
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globalSearch().queryKey })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.getById(updatedCustomer.id).queryKey })
    },
    meta: {
      toastTitle: {
        loading: 'Updating customer...',
        success: '✅ Customer updated',
        error: '❌ Failed to update customer',
      },
    },
  })

  if (error) {
    return <Detail markdown={error.message} />
  }

  if (!customer) {
    return null
  }

  return (
    <CustomerForm
      ctaText="Save Customer"
      onSubmit={(values) =>
        editCustomerMutation.mutate({
          id: customer.id,
          requestBody: values,
        })
      }
      isLoading={isLoading || editCustomerMutation.isPending}
      initialValues={customer}
    />
  )
}

export default withMiddayClient(EditCustomer)
