import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";

import { withMiddayClient } from "./with-midday-client";
import { useTransactions } from "./hooks/use-transactions";
import { useCachedState } from "@raycast/utils";
import { useState } from "react";
import { formatCurrency } from "./utils";

function TransactionsComponent() {
  const [query, setQuery] = useState<string | undefined>(undefined);
  const { transactions, isLoading, error } = useTransactions(query);

  const [showDetails, setShowDetails] = useCachedState<boolean>("show-details", false, {
    cacheNamespace: "midday",
  });

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search transactions"
      isShowingDetail={showDetails}
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

      {!error && transactions.length === 0 && (
        <List.EmptyView title="No transactions found!" icon={{ source: Icon.Warning, tintColor: Color.Orange }} />
      )}

      {transactions.map((tx) => {
        return (
          <List.Item
            key={tx.id}
            title={tx.name}
            accessories={[
              {
                text: {
                  value: formatCurrency(tx.amount, tx.currency),
                  color: tx.amount > 0 ? Color.Green : Color.PrimaryText,
                },
              },
              {
                date: new Date(tx.date),
              },
              {
                icon:
                  (tx.attachments ?? []).length > 0
                    ? { source: Icon.CheckCircle, tintColor: Color.Green }
                    : { source: Icon.Circle, tintColor: Color.Orange },
              },
            ]}
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Link
                      title="View on Midday"
                      text={`https://app.midday.ai/transactions?transactionId=${tx.id}`}
                      target={`https://app.midday.ai/transactions?transactionId=${tx.id}`}
                    />

                    <List.Item.Detail.Metadata.Label
                      title="Amount"
                      text={{
                        value: formatCurrency(tx.amount, tx.currency),
                        color: tx.amount > 0 ? Color.Green : Color.PrimaryText,
                      }}
                    />

                    {tx.category && (
                      <>
                        <List.Item.Detail.Metadata.Separator />

                        <List.Item.Detail.Metadata.Label
                          title="Category"
                          text={tx.category.name}
                          icon={{ source: Icon.Tag, tintColor: tx.category.color }}
                        />
                      </>
                    )}

                    {(tx.attachments ?? []).length > 0 ? (
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

                    {(tx.attachments ?? []).length > 0 && (
                      <List.Item.Detail.Metadata.TagList title="Attachments">
                        {(tx.attachments ?? []).map((attachment) => {
                          if (!attachment.filename) {
                            return null;
                          }

                          return (
                            <List.Item.Detail.Metadata.TagList.Item key={attachment.id} text={attachment.filename} />
                          );
                        })}
                      </List.Item.Detail.Metadata.TagList>
                    )}

                    {tx.note && <List.Item.Detail.Metadata.Label title="Note" text={tx.note} />}
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                <Action
                  title={showDetails ? "Hide Details" : "Show Details"}
                  shortcut={{ modifiers: ["cmd"], key: "d" }}
                  onAction={() => setShowDetails(!showDetails)}
                  icon={showDetails ? Icon.EyeDisabled : Icon.Eye}
                />
                <Action.OpenInBrowser
                  title="View on Midday"
                  url={`https://app.midday.ai/transactions?transactionId=${tx.id}`}
                />

                {/* <ActionPanel.Section>
                  <Action.OpenInBrowser
                    title="View on Midday"
                    url={`https://app.midday.ai/transactions?transactionId=${tx.id}`}
                    shortcut={{ modifiers: ['cmd'], key: 'enter' }}
                  />
                </ActionPanel.Section> */}
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

export default withMiddayClient(TransactionsComponent);
