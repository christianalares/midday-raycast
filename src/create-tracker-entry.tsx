import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type TrackerEntry, TrackerEntryForm } from './components/forms/tracker-entry-form'
import { api } from './api'
import { queryKeys } from './api/queries'
import { useNavigation } from '@raycast/api'
import TrackerEntries from './tracker-entries'
import { withMiddayClient } from './lib/with-midday-client'

type Props = {
  projectId: string
  initialValues?: Partial<TrackerEntry>
}

const CreateTrackerEntry = ({ projectId, initialValues }: Props) => {
  const navigation = useNavigation()
  const queryClient = useQueryClient()

  const createTrackerEntryMutation = useMutation({
    mutationFn: api.createTrackerEntry,
    meta: {
      toastTitle: {
        loading: 'Creating tracker entry...',
        success: '✅ Tracker entry created',
        error: '❌ Failed to create tracker entry',
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackerProjects.list().queryKey })
      navigation.push(<TrackerEntries projectId={projectId} />)
    },
  })

  return (
    <TrackerEntryForm
      onSubmit={(values) => {
        createTrackerEntryMutation.mutate({
          start: values.start,
          stop: values.stop,
          description: values.description,
          projectId,
          dates: [],
          assignedId: '',
          duration: values.stop.getTime() / 1000 - values.start.getTime() / 1000,
        })
      }}
      ctaText="Create Tracking Entry"
      isLoading={false}
      initialValues={initialValues}
    />
  )
}

export default withMiddayClient(CreateTrackerEntry)
