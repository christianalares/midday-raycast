import { Form, Action, ActionPanel } from '@raycast/api'
import { FormValidation, useForm } from '@raycast/utils'
import { cleanFormProps } from '../../lib/utils'
import { addHours, startOfHour } from 'date-fns'

export type TrackerEntry = {
  start: Date
  stop: Date
  description?: string
}

type Props = {
  onSubmit: (values: TrackerEntry) => void
  initialValues?: Parameters<typeof useForm<TrackerEntry>>[0]['initialValues']
  ctaText: string
  isLoading: boolean
}

export const TrackerEntryForm = ({ onSubmit, initialValues, ctaText, isLoading }: Props) => {
  const form = useForm<TrackerEntry>({
    onSubmit,
    initialValues: {
      start: startOfHour(new Date()),
      stop: addHours(startOfHour(new Date()), 1),
      ...initialValues,
    },
    validation: {
      start: FormValidation.Required,
      stop: FormValidation.Required,
    },
  })

  return (
    <Form
      // navigationTitle="Create Tracker Entry"
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title={ctaText} onSubmit={form.handleSubmit} />
        </ActionPanel>
      }
    >
      {/* @ts-ignore */}
      <Form.DatePicker title="Start" {...form.itemProps.start} />
      {/* @ts-ignore */}
      <Form.DatePicker title="Stop" {...form.itemProps.stop} />
      <Form.TextArea title="Description" {...form.itemProps.description} />
    </Form>
  )
}
