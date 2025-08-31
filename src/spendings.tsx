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

type DateFilter = {
  value: string;
  label: string;
  from: Date;
  to: Date;
};

const DATE_FILTERS: DateFilter[] = [
  {
    value: "last30Days",
    label: "Last 30 days",
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date()),
  },
  {
    value: "thisMonth",
    label: "This month",
    from: startOfMonth(new Date()),
    to: endOfDay(new Date()),
  },
  {
    value: "lastMonth",
    label: "Last month",
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(subMonths(new Date(), 1)),
  },
  {
    value: "thisYear",
    label: "This year",
    from: startOfYear(new Date()),
    to: endOfYear(new Date()),
  },
  {
    value: "lastYear",
    label: "Last year",
    from: startOfYear(subYears(new Date(), 1)),
    to: endOfYear(subYears(new Date(), 1)),
  },
];

function TransactionsComponent() {
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS[0]);
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
            const foundFilter = DATE_FILTERS.find((filter) => filter.value === value);

            if (!foundFilter) {
              return;
            }

            setDateFilter(foundFilter);
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
