import { Action, Color, Icon, Image, type Keyboard, LaunchType, MenuBarExtra, launchCommand, open } from '@raycast/api'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './api/queries'
import { formatCurrency, formatTimerDuration } from './lib/utils'
import { withMiddayClient } from './lib/with-midday-client'
import { useEffect, useState } from 'react'
import { useTrackingTimer } from './hooks/use-tracking-timer'

function MenuBar() {
  const { getFromCache } = useTrackingTimer()
  // const { data: timerStatusData, isLoading: isLoadingTimerStatus } = useQuery(queryKeys.trackerTimer.status())
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery(queryKeys.transactions.list())
  const { data: trackerProjectsData, isLoading: isLoadingTrackerProjects } = useQuery(queryKeys.trackerProjects.list())

  const transactions = (transactionsData ?? []).slice(0, 9)
  const trackerProjects = (trackerProjectsData ?? []).slice(0, 9)

  const elapsedTimer = getFromCache()

  // console.log(elapsedTimer)

  // const isTimerRunning = timerStatusData?.data.isRunning && timerStatusData.data.elapsedTime > 0

  return (
    <MenuBarExtra
      icon={{
        source: 'midday-light.svg',
        tintColor: {
          light: elapsedTimer ? '#e65247' : '#000000',
          dark: elapsedTimer ? '#e65247' : '#FFFFFF',
          adjustContrast: true,
        },
      }}
      tooltip="Midday"
      isLoading={isLoadingTransactions || isLoadingTrackerProjects}
      title={elapsedTimer ? formatTimerDuration(elapsedTimer) : undefined}
    >
      <MenuBarExtra.Section title="Latest Transactions">
        {isLoadingTransactions ? (
          <MenuBarExtra.Item title="Loading Transactions..." />
        ) : (
          transactions.map((tx, i) => (
            <MenuBarExtra.Item
              key={tx.id}
              title={tx.name}
              subtitle={formatCurrency(tx.amount, tx.currency)}
              shortcut={{ modifiers: ['cmd'], key: `${i + 1}` as Keyboard.KeyEquivalent }}
              icon={
                (tx.attachments ?? []).length > 0
                  ? {
                      source: Icon.CheckCircle,
                      tintColor: Color.Green,
                    }
                  : Icon.Circle
              }
              alternate={
                <MenuBarExtra.Item
                  title={tx.name}
                  subtitle={formatCurrency(tx.amount, tx.currency)}
                  icon={Icon.ArrowNe}
                  onAction={() => {
                    open(`https://app.midday.ai/transactions?transactionId=${tx.id}`)
                  }}
                />
              }
              onAction={() => {
                launchCommand({
                  type: LaunchType.UserInitiated,
                  name: 'transactions',
                  // TODO: How to pass props to the command/component?
                  // arguments: {
                  //   selectedId: tx.id,
                  // },
                  // context: {
                  //   showInitialDetails: true,
                  //   selectedId: tx.id,
                  // },
                })
              }}
            />
          ))
        )}
      </MenuBarExtra.Section>

      <MenuBarExtra.Section title="Tracker">
        {isLoadingTrackerProjects ? (
          <MenuBarExtra.Item title="Loading Tracker Projects..." />
        ) : (
          trackerProjects.map((project) => <MenuBarExtra.Item key={project.id} title={project.name} />)
        )}
      </MenuBarExtra.Section>
    </MenuBarExtra>
  )
}

export default withMiddayClient(MenuBar)
