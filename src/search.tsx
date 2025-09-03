import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useState } from "react";
import CreateCustomer from "./create-customer";
import TransactionsComponent from "./transactions";
import { withMiddayClient } from "./lib/with-midday-client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, type QueryResults } from "./api/queries";

const Search = () => {
  const [query, setQuery] = useState("");
  const { data, isLoading, error } = useQuery(queryKeys.globalSearch.list(query));

  const search = data ?? [];

  const vaultResults = search.filter((result) => result.type === "vault");
  const customerResults = search.filter((result) => result.type === "customer");
  const invoicesResults = search.filter((result) => result.type === "invoice");
  const transactionResults = search.filter((result) => result.type === "transaction");
  const inboxResults = search.filter((result) => result.type === "inbox");

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search transactions"
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

      {!error && search.length === 0 && (
        <List.EmptyView title="No search results found!" icon={{ source: Icon.Warning, tintColor: Color.Orange }} />
      )}

      <VaultList results={vaultResults} />
      <CustomersList results={customerResults} />
      <InvoicesList results={invoicesResults} />
      <TransactionsList results={transactionResults} />
      {/* TODO: Add tracker */}
      <InboxList results={inboxResults} />
    </List>
  );
};

type ResultItem = QueryResults["globalSearch"]["list"][number];
type ListResultsByType<T extends ResultItem["type"]> = Array<Extract<ResultItem, { type: T }>>;

const VaultList = ({ results }: { results: ListResultsByType<"vault"> }) => {
  return (
    <List.Section title="Vault">
      {results.map((result) => (
        <List.Item key={result.id} title={result.data.path_tokens.at(-1) ?? ""} icon={Icon.Document} />
      ))}

      <List.Item
        title="View vault"
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
  );
};

const CustomersList = ({ results }: { results: ListResultsByType<"customer"> }) => {
  return (
    <List.Section title="Customers">
      {results.map((result) => (
        <List.Item
          key={result.id}
          title={result.data.name}
          icon={Icon.Person}
          accessories={[
            {
              text: result.data.email,
            },
          ]}
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
  );
};

const InvoicesList = ({ results }: { results: ListResultsByType<"invoice"> }) => {
  return (
    <List.Section title="Invoices">
      {results.map((result) => (
        <List.Item key={result.id} title={result.data.customer_name} icon={Icon.Document} />
      ))}

      {/* TODO: Add create invoice */}
      {/* <List.Item title="Create invoice" icon={Icon.ArrowNe} /> */}

      <List.Item
        title="View invoices"
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
  );
};

const TransactionsList = ({ results }: { results: ListResultsByType<"transaction"> }) => {
  return (
    <List.Section title="Transactions">
      {results.map((result) => (
        <List.Item key={result.id} title={result.data.name} icon={Icon.List} />
      ))}

      {/*  */}
      {/* <List.Item title="Create transaction" icon={Icon.ArrowNe} /> */}
      <List.Item
        title="View transactions"
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
  );
};

const InboxList = ({ results }: { results: ListResultsByType<"inbox"> }) => {
  return (
    <List.Section title="Inbox">
      {results.map((result) => (
        <List.Item key={result.id} title={result.data.file_name} icon={Icon.Document} />
      ))}

      <List.Item
        title="View inbox"
        icon={Icon.ArrowNe}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser url="https://app.midday.ai/inbox" title="View inbox on Midday" />
          </ActionPanel>
        }
      />
    </List.Section>
  );
};

export default withMiddayClient(Search);
