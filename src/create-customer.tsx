import { useNavigation } from '@raycast/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { queryKeys } from './api/queries'
import { CustomerForm } from './components/forms/customer-form'
import { withMiddayClient } from './lib/with-midday-client'
import Search from './search'

const CreateCustomer = () => {
  const queryClient = useQueryClient()
  const navigation = useNavigation()

  const createCustomerMutation = useMutation({
    mutationFn: api.customers.create,
    onSuccess: (createdCustomer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globalSearch().queryKey })
      navigation.push(<Search selectedId={createdCustomer.id} />)
    },
    meta: {
      toastTitle: {
        loading: 'Creating customer...',
        success: '✅ Customer created',
        error: '❌ Failed to create customer',
      },
    },
  })

  return (
    <CustomerForm
      ctaText="Create Customer"
      initialValues={{
        name: 'Christian Test',
        email: 'christian@hiddenvillage.se',
        billingEmail: 'christian@hiddenvillage.se',
        addressLine1: '123 Main St',
        country: 'SE',
      }}
      onSubmit={createCustomerMutation.mutate}
      isLoading={createCustomerMutation.isPending}
    />
  )
}

export default withMiddayClient(CreateCustomer)
