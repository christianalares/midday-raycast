import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { queryKeys } from "./api/queries";
import { CustomerForm } from "./components/forms/customer-form";
import { withMiddayClient } from "./lib/with-midday-client";

type Props = {
  customerId: string;
};

const EditCustomer = ({ customerId }: Props) => {
  const { data: customer, isLoading, error } = useQuery(queryKeys.customers.get(customerId));

  const queryClient = useQueryClient();

  const editCustomerMutation = useMutation({
    mutationFn: api.updateCustomer,
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globalSearch._def });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.get(updatedCustomer.id).queryKey });
    },
    meta: {
      toastTitle: {
        loading: "Updating customer...",
        success: "✅ Customer updated",
        error: "❌ Failed to update customer",
      },
    },
  });

  if (!customer) {
    return null;
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
      isLoading={editCustomerMutation.isPending}
      initialValues={customer}
    />
  );
};

export default withMiddayClient(EditCustomer);
