import { Color, Icon, type Keyboard, LaunchType, MenuBarExtra, launchCommand, open } from '@raycast/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from './api'
import { queryKeys } from './api/queries'
import {
  clearCurrentInterval,
  getCurrentInterval,
  getLastCheckTimestamp,
  setCurrentInterval,
  setLastCheckTimestamp,
} from './lib/interval'
import { formatCurrency, formatTimerDuration } from './lib/utils'
import { withMiddayClient } from './lib/with-midday-client'

function MenuBar() {
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery(
    queryKeys.transactions.list({
      pageSize: 9,
    }),
  )
  const { data: trackerProjectsData, isLoading: isLoadingTrackerProjects } = useQuery(queryKeys.trackerProjects.list())

  const checkTimerMutation = useMutation({
    mutationFn: api.tracker.timer.getStatus,
    onSuccess: ({ data }) => {
      if (data.isRunning) {
        setCurrentInterval(data.elapsedTime)
      } else {
        clearCurrentInterval()
      }
    },
  })

  useEffect(() => {
    const currentInterval = getCurrentInterval()

    if (currentInterval) {
      const diffSinceLastUpdateInSeconds = (new Date().getTime() - currentInterval.lastStoredCache.getTime()) / 1000

      if (diffSinceLastUpdateInSeconds > 60) {
        checkTimerMutation.mutate()
      }
    } else {
      const lastCheckTimestamp = getLastCheckTimestamp()

      if (!lastCheckTimestamp) {
        return
      }

      const now = new Date()

      const diffInSeconds = (now.getTime() - lastCheckTimestamp.getTime()) / 1000

      // If the last check was more than 15 minutes ago, check the timer status
      if (diffInSeconds > 60 * 15 || diffInSeconds === 0) {
        checkTimerMutation.mutate(undefined, {
          onSuccess: ({ data }) => {
            if (data.isRunning) {
              setCurrentInterval(data.elapsedTime)
            }

            setLastCheckTimestamp()
          },
        })
      }
    }
  }, [])

  const currentInterval = getCurrentInterval()

  const transactions = transactionsData ?? []
  const trackerProjects = trackerProjectsData ?? []

  return (
    <MenuBarExtra
      icon={{
        source: 'midday-light.svg',
        tintColor: {
          light: currentInterval ? '#e65247' : '#000000',
          dark: currentInterval ? '#e65247' : '#FFFFFF',
          adjustContrast: true,
        },
      }}
      tooltip="Midday"
      isLoading={isLoadingTransactions || isLoadingTrackerProjects}
      title={currentInterval ? formatTimerDuration(currentInterval.elapsedTime) : undefined}
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

      {trackerProjects.length > 0 && (
        <MenuBarExtra.Section title="Tracker">
          {isLoadingTrackerProjects ? (
            <MenuBarExtra.Item title="Loading Tracker Projects..." />
          ) : (
            trackerProjects.map((project) => <MenuBarExtra.Item key={project.id} title={project.name} />)
          )}
        </MenuBarExtra.Section>
      )}
    </MenuBarExtra>
  )
}

export default withMiddayClient(MenuBar)
