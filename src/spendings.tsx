import { Color, Icon, List } from "@raycast/api";
import { useSpendings } from "./hooks/use-spendings";
import { formatCurrency } from "./utils";
import { withMiddayClient } from "./with-midday-client";
import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  endOfDay,
  subMonths,
  subYears,
  startOfDay,
  subDays,
} from "date-fns";

const DATE_FILTERS = [
  { label: "Last 30 days", value: "last30Days" },
  { label: "This month", value: "thisMonth" },
  { label: "Last month", value: "lastMonth" },
  { label: "This year", value: "thisYear" },
  { label: "Last year", value: "lastYear" },
] as const;

type DateFilter = (typeof DATE_FILTERS)[number]["value"];

const getDateFilter = (value: DateFilter) => {
  switch (value) {
    case "last30Days":
      return {
        from: startOfDay(subDays(new Date(), 30)),
        to: endOfDay(new Date()),
      };
    case "thisMonth":
      return {
        from: startOfMonth(new Date()),
        to: endOfDay(new Date()),
      };
    case "lastMonth":
      return {
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1)),
      };
    case "thisYear":
      return {
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
      };
    case "lastYear":
      return {
        from: startOfYear(subYears(new Date(), 1)),
        to: endOfYear(subYears(new Date(), 1)),
      };
    default:
      return {
        from: startOfDay(subDays(new Date(), 30)),
        to: endOfDay(new Date()),
      };
  }
};

function TransactionsComponent() {
  const [dateFilter, setDateFilter] = useState(getDateFilter("last30Days"));
  const { spendings, isLoading, error } = useSpendings({ from: dateFilter.from, to: dateFilter.to });

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Filter category"
      throttle={true}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by status"
          onChange={(value) => {
            setDateFilter(getDateFilter(value as DateFilter));
          }}
        >
          <List.Dropdown.Section>
            {DATE_FILTERS.map((dateFilter) => (
              <List.Dropdown.Item
                key={dateFilter.value}
                icon={Icon.Calendar}
                title={dateFilter.label}
                value={dateFilter.value}
              />
            ))}
          </List.Dropdown.Section>
        </List.Dropdown>
      }
    >
      {error && (
        <List.EmptyView
          title={error.message}
          description="Please try again"
          icon={{ source: Icon.Warning, tintColor: Color.Red }}
        />
      )}

      {!error && spendings.length === 0 && (
        <List.EmptyView title="No spendings found!" icon={{ source: Icon.Warning, tintColor: Color.Orange }} />
      )}

      {spendings.map((spending) => {
        return (
          <List.Item
            key={spending.name}
            title={spending.name}
            icon={{ source: Icon.Tag, tintColor: spending.color }}
            accessories={[
              {
                tag: `${spending.percentage.toString()}%`,
              },
              {
                text: formatCurrency(spending.amount, spending.currency),
              },
            ]}
          />
        );
      })}
    </List>
  );
}

export default withMiddayClient(TransactionsComponent);
