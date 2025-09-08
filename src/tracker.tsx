import { Action, ActionPanel, Color, Icon, Image, List } from '@raycast/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from './api'
import { type QueryResults, queryKeys } from './api/queries'
import { formatCurrency, formatDurationFromSeconds, formatTimerDuration } from './lib/utils'
import { withMiddayClient } from './lib/with-midday-client'

const Tracker = () => {
  const { data: trackerProjects, isLoading, error } = useQuery(queryKeys.trackerProjects.list())

  const [showDetails, setShowDetails] = useState(false)

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search projects" throttle={true} isShowingDetail={showDetails}>
      {error && (
        <List.EmptyView
          title={error.message}
          description="Please try again"
          icon={{ source: Icon.Warning, tintColor: Color.Red }}
        />
      )}

      {!error && trackerProjects?.length === 0 && (
        <List.EmptyView title="No spendings found!" icon={{ source: Icon.Warning, tintColor: Color.Orange }} />
      )}

      {trackerProjects?.map((project) => {
        return (
          <ProjectListItem
            key={project.id}
            project={project}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
          />
        )
      })}
    </List>
  )
}

type ProjectListItemProps = {
  project: QueryResults['trackerProjects']['list'][number]
  showDetails: boolean
  setShowDetails: (showDetails: boolean) => void
}

const ProjectListItem = ({ project, showDetails, setShowDetails }: ProjectListItemProps) => {
  const [elapsedTimer, setElapsedTimer] = useState(project.timer?.elapsedTime)

  const queryClient = useQueryClient()

  const startTrackerTimerMutation = useMutation({
    mutationFn: api.startTrackerTimer,
    meta: {
      toastTitle: {
        loading: 'Starting timer...',
        success: `✅ Timer started for ${project.name}`,
        error: '❌ Failed to start timer',
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackerProjects.list().queryKey })
    },
  })

  const stopTrackerTimerMutation = useMutation({
    mutationFn: api.stopTrackerTimer,
    meta: {
      toastTitle: {
        loading: 'Stopping timer...',
        success: `✅ Timer stopped for ${project.name}`,
        error: '❌ Failed to stop timer',
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackerProjects.list().queryKey })
    },
  })

  const assignedTo = project.users?.at(0)

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (project.timer) {
      timer = setInterval(() => {
        setElapsedTimer((prev) => (prev ? prev + 1 : undefined))
      }, 1000)
    } else {
      setElapsedTimer(undefined)
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [project.timer])

  return (
    <List.Item
      key={project.id}
      title={project.name}
      icon={Icon.Play}
      accessories={[
        ...(elapsedTimer
          ? [
              {
                tag: formatTimerDuration(elapsedTimer),
                icon: { source: Icon.CircleProgress100, tintColor: Color.Red },
              },
            ]
          : []),
        ...(assignedTo
          ? [
              {
                icon: {
                  source: assignedTo.avatarUrl,
                  mask: Image.Mask.Circle,
                },
              },
            ]
          : []),
      ]}
      detail={
        <List.Item.Detail
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label
                title="Created at"
                text={new Date(project.createdAt).toLocaleDateString()}
              />

              <List.Item.Detail.Metadata.TagList title="Status">
                <List.Item.Detail.Metadata.TagList.Item
                  text={project.status === 'in_progress' ? 'In Progress' : 'Completed'}
                  color={project.status === 'in_progress' ? Color.Blue : Color.Green}
                />
              </List.Item.Detail.Metadata.TagList>

              {assignedTo && (
                <List.Item.Detail.Metadata.Label
                  title="Assigned to"
                  icon={{ mask: Image.Mask.Circle, source: assignedTo.avatarUrl }}
                  text={assignedTo.fullName}
                />
              )}

              <List.Item.Detail.Metadata.Label
                title="Total time"
                text={formatDurationFromSeconds(project.totalDuration || 0)}
              />

              <List.Item.Detail.Metadata.Label
                title="Total amount"
                text={formatCurrency(project.totalAmount, project.currency ?? 'USD')}
              />

              {project.description && (
                <List.Item.Detail.Metadata.Label title="Description" text={project.description} />
              )}
            </List.Item.Detail.Metadata>
          }
        />
      }
      actions={
        <ActionPanel>
          <Action
            title={showDetails ? 'Hide Details' : 'Show Details'}
            onAction={() => setShowDetails(!showDetails)}
            icon={showDetails ? Icon.EyeDisabled : Icon.Eye}
          />

          <ActionPanel.Section>
            {elapsedTimer ? (
              <Action
                title="Stop timer"
                onAction={() => stopTrackerTimerMutation.mutate()}
                shortcut={{ modifiers: ['cmd'], key: 'r' }}
                icon={{
                  source: Icon.Stop,
                  tintColor: Color.Red,
                }}
              />
            ) : (
              <Action
                title="Start timer"
                onAction={() => startTrackerTimerMutation.mutate(project.id)}
                shortcut={{ modifiers: ['cmd'], key: 'r' }}
                icon={{
                  source: Icon.CircleProgress100,
                  tintColor: Color.Red,
                }}
              />
            )}
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  )
}

export default withMiddayClient(Tracker)
