import { Action, ActionPanel, List } from '@raycast/api'
import { useQuery } from '@tanstack/react-query'
import {
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  isSameDay,
  set,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { Fragment, useState } from 'react'
import { queryKeys } from './api/queries'
import CreateTrackerEntry from './create-tracker-entry'
import { formatCurrency, formatDurationFromSeconds } from './lib/utils'
import { withMiddayClient } from './lib/with-midday-client'

type Props = {
  projectId: string
  from?: Date
  to?: Date
}

const TrackerEntries = ({ projectId, from, to }: Props) => {
  const [showDetails, setShowDetails] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { data, isLoading } = useQuery(
    queryKeys.trackerEntries.getByProjectId({
      projectId,
      from: from ?? startOfMonth(currentMonth),
      to: to ?? endOfMonth(currentMonth),
    }),
  )

  if (!data) {
    return null
  }

  const trackerEntries = Object.values(data.result).flat()

  const days = eachDayOfInterval({
    start: startOfDay(startOfMonth(currentMonth)),
    end: endOfDay(endOfMonth(currentMonth)),
  })

  const daysWithEntries = days.map((day) => {
    const entriesInDay = trackerEntries.filter((entry) => isSameDay(entry.date, day))

    return {
      date: day,
      entries: entriesInDay,
    }
  })

  // Estimate the currency based on the entries
  const probableCurrency = daysWithEntries.flatMap((day) => day.entries).find((entry) => entry.project.currency)
    ?.project.currency

  const totalAmount = probableCurrency ? formatCurrency(data.meta.totalAmount, probableCurrency) : false
  const totalDuration = formatDurationFromSeconds(trackerEntries.reduce((acc, entry) => acc + entry.duration, 0))
  const totalEntries = `${trackerEntries.length} entries`

  const subTitle = [totalAmount, totalDuration, totalEntries].filter(Boolean).join(' / ')

  return (
    <List isLoading={isLoading} isShowingDetail={showDetails}>
      <List.Section
        title={new Intl.DateTimeFormat(undefined, { month: 'long' }).format(currentMonth)}
        subtitle={subTitle}
      >
        {daysWithEntries.map((day) => (
          <List.Item
            key={day.date.toISOString()}
            title={format(day.date, 'EEEE, dd')}
            accessories={day.entries.map((entry) => ({
              // TODO: Also show income for the entry?
              tag: `${formatDurationFromSeconds(entry.duration)}`,
            }))}
            actions={
              <ActionPanel>
                <Action
                  title={showDetails ? 'Hide Details' : 'Show Details'}
                  onAction={() => setShowDetails(!showDetails)}
                />

                <Action.Push
                  title="Create Tracker Entry"
                  shortcut={{ modifiers: ['cmd'], key: 'return' }}
                  target={
                    <CreateTrackerEntry
                      projectId={projectId}
                      initialValues={{
                        // Working 9 - 5 🎶 🎤
                        start: set(new Date(day.date), { hours: 9, minutes: 0, seconds: 0 }),
                        stop: set(new Date(day.date), { hours: 17, minutes: 0, seconds: 0 }),
                      }}
                    />
                  }
                />

                <ActionPanel.Section title="Navigation">
                  <Action
                    title="Previous Month"
                    onAction={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    shortcut={{ modifiers: ['cmd'], key: 'arrowLeft' }}
                  />
                  <Action
                    title="Next Month"
                    onAction={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    shortcut={{ modifiers: ['cmd'], key: 'arrowRight' }}
                  />
                  <Action
                    title="Today"
                    onAction={() => setCurrentMonth(new Date())}
                    shortcut={{ modifiers: ['cmd'], key: 't' }}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
            detail={
              <List.Item.Detail
                isLoading={isLoading}
                metadata={
                  day.entries.length === 0 ? null : (
                    <List.Item.Detail.Metadata>
                      {day.entries.map((entry) => (
                        <Fragment key={entry.id}>
                          <List.Item.Detail.Metadata.Label
                            title="Created at"
                            text={new Date(entry.createdAt).toLocaleString()}
                          />

                          {entry.description && (
                            <List.Item.Detail.Metadata.Label title="Description" text={entry.description} />
                          )}

                          <List.Item.Detail.Metadata.Label
                            title="Start"
                            text={new Date(entry.start).toLocaleString()}
                          />
                          <List.Item.Detail.Metadata.Label title="End" text={new Date(entry.stop).toLocaleString()} />

                          <List.Item.Detail.Metadata.Label
                            title="Duration"
                            text={formatDurationFromSeconds(entry.duration)}
                          />

                          {entry.project.rate && entry.project.currency && (
                            <List.Item.Detail.Metadata.Label
                              title="Amount"
                              text={formatCurrency(
                                (entry.duration / 60 / 60) * entry.project.rate,
                                entry.project.currency,
                              )}
                            />
                          )}

                          <List.Item.Detail.Metadata.Label title="Currency" text={entry.project.currency?.toString()} />
                          <List.Item.Detail.Metadata.Label title="Rate" text={entry.project.rate?.toString()} />

                          <List.Item.Detail.Metadata.Separator />
                        </Fragment>
                      ))}

                      <List.Item.Detail.Metadata.Separator />

                      <List.Item.Detail.Metadata.Label
                        title="Total Amount"
                        text={formatCurrency(
                          day.entries.reduce(
                            (acc, entry) => acc + (entry.duration / 60 / 60) * (entry.project.rate ?? 0),
                            0,
                          ),
                          day.entries[0].project.currency ?? 'USD',
                        )}
                      />
                    </List.Item.Detail.Metadata>
                  )
                }
              />
            }
          />
        ))}
      </List.Section>
    </List>
  )
}

export default withMiddayClient(TrackerEntries)
