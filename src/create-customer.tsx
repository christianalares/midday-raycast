import { Action, ActionPanel, captureException, Form, showToast, Toast } from "@raycast/api";
import { withMiddayClient } from "./lib/with-midday-client";
import { FormValidation, useForm } from "@raycast/utils";
import { api, CreateCustomerArgs } from "./api";
import { countries } from "./lib/countries";

// Helper function to clean form props by converting null to undefined
const cleanFormProps = (props: any) => ({
  ...props,
  value: props.value === null ? undefined : props.value,
  defaultValue: props.defaultValue === null ? undefined : props.defaultValue,
});

const CreateCustomer = () => {
  const form = useForm<CreateCustomerArgs>({
    onSubmit: async (values) => {
      await showToast({
        style: Toast.Style.Animated,
        title: "Creating customer...",
      });

      api
        .createCustomer(values)
        .then(async (createdCustomer) => {
          await showToast({
            style: Toast.Style.Success,
            title: "✅ Customer created",
            message: `Customer ${createdCustomer.name} created`,
          });
        })
        .catch(async (err) => {
          console.log(err);
          captureException(err);

          await showToast({
            style: Toast.Style.Failure,
            title: "❌ Failed to create customer",
            message: err.message,
          });
        });

      console.log("submit", values);
    },
    initialValues: {
      name: "Christian Test",
      email: "christian@hiddenvillage.se",
      billingEmail: "christian@hiddenvillage.se",
      addressLine1: "123 Main St",
      country: "SE",
    },
    validation: {
      name: FormValidation.Required,
      email: FormValidation.Required,
      billingEmail: FormValidation.Required,
      addressLine1: FormValidation.Required,
      country: FormValidation.Required,
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Customer" onSubmit={form.handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField title="Name" placeholder="Acme Inc" {...form.itemProps.name} />
      <Form.TextField title="Email" placeholder="acme@example.com" {...form.itemProps.email} />
      <Form.TextField
        title="Billing Email"
        info="This is an additional email that will be used to send invoices to."
        placeholder="finance@example.com"
        {...cleanFormProps(form.itemProps.billingEmail)}
      />

      <Form.TextField title="Phone" placeholder="+ (555) 123-4567" {...cleanFormProps(form.itemProps.phone)} />
      <Form.TextField title="Website" placeholder="acme.com" {...cleanFormProps(form.itemProps.website)} />
      <Form.TextField title="Contact person" placeholder="John Doe" {...cleanFormProps(form.itemProps.contact)} />

      <Form.Separator />

      <Form.TextField
        title="Address Line 1"
        placeholder="123 Main St"
        {...cleanFormProps(form.itemProps.addressLine1)}
      />
      <Form.TextField title="Address Line 2" placeholder="Suite 100" {...cleanFormProps(form.itemProps.addressLine2)} />

      <Form.Dropdown title="Country" {...cleanFormProps(form.itemProps.country)}>
        {Object.values(countries).map((country) => (
          <Form.Dropdown.Item key={country.code} value={country.code} title={country.name} icon={country.emoji} />
        ))}
      </Form.Dropdown>

      <Form.TextField title="City" placeholder="New York" {...cleanFormProps(form.itemProps.city)} />
      <Form.TextField title="State / Province" placeholder="NY" {...cleanFormProps(form.itemProps.state)} />
      <Form.TextField title="ZIP Code / Postal Code" placeholder="10001" {...cleanFormProps(form.itemProps.zip)} />

      <Form.Separator />

      <Form.TextField
        title="Tax ID / VAT Number"
        placeholder="Enter VAT number"
        {...cleanFormProps(form.itemProps.vatNumber)}
      />
      <Form.TextArea title="Notes" placeholder="Additional information..." {...cleanFormProps(form.itemProps.note)} />
    </Form>
  );
};

export default withMiddayClient(CreateCustomer);
