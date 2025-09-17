import { Color, Icon, type Keyboard, LaunchType, MenuBarExtra, launchCommand } from '@raycast/api'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './api/queries'
import { formatCurrency } from './lib/utils'
import { withMiddayClient } from './lib/with-midday-client'

function MenuBar() {
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery(queryKeys.transactions.list())

  const transactions = (transactionsData ?? []).slice(0, 9)

  return (
    <MenuBarExtra icon="https://app.midday.ai/favicon.ico" tooltip="Midday">
      <MenuBarExtra.Section title="Latest Transactions">
        {isLoadingTransactions ? (
          <MenuBarExtra.Item title="Loading Transactions..." />
        ) : (
          transactions.map((tx: any, i: number) => (
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
    </MenuBarExtra>
  )
}

export default withMiddayClient(MenuBar)
