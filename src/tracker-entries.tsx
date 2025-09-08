import { endOfMonth, startOfMonth, startOfYear } from 'date-fns'
import { withMiddayClient } from './lib/with-midday-client'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './api/queries'
import { Detail, List } from '@raycast/api'

type Props = {
  projectId: string
  from?: Date
  to?: Date
}

const TrackerEntries = ({ projectId, from, to }: Props) => {
  const { data, isLoading, error } = useQuery(
    queryKeys.trackerEntries.getByProjectId({
      projectId,
      from: from ?? startOfYear(new Date()),
      to: to ?? endOfMonth(new Date()),
    }),
  )

  if (!data) {
    return null
  }

  const trackerEntries = Object.entries(data.result)

  console.log(trackerEntries)

  return (
    <List>
      {trackerEntries.map(([date, entries]) => {
        return (
          <List.Section key={date} title={date}>
            {entries.map((entry) => (
              <List.Item
                key={entry.id}
                title={entry.project.name}
                // accessories={[{
                //   text:
                // }]}
              />
            ))}
          </List.Section>
        )
      })}
    </List>
  )
}

export default withMiddayClient(TrackerEntries)
