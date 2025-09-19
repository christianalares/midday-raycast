import { tryCatch } from '../lib/utils'
import { getMiddayClient } from './oauth'

// --------------------- Tracker Timer ---------------------
const getTimerStatus = async () => {
  const midday = getMiddayClient()

  const timerStatus = await tryCatch(midday.trackerTimer.getTimerStatus({}))

  return timerStatus
}

const startTrackerTimer = async (projectId: string) => {
  const midday = getMiddayClient()

  const startedTimer = await tryCatch(midday.trackerTimer.startTimer({ projectId }))

  return startedTimer.data
}

const stopTrackerTimer = async () => {
  const midday = getMiddayClient()

  const stoppedTimer = await tryCatch(midday.trackerTimer.stopTimer({}))

  return stoppedTimer.data
}

// --------------------- Tracker Projects ---------------------
const getTrackerProjects = async () => {
  const midday = getMiddayClient()

  const trackerProjects = await tryCatch(midday.trackerProjects.list({}))

  const timer = await tryCatch(midday.trackerTimer.getTimerStatus({}))

  const trackerProjectsWithTimer = trackerProjects.data.map((project) => {
    return {
      ...project,
      timer: timer.data.currentEntry?.projectId === project.id ? timer.data : null,
    }
  })

  return trackerProjectsWithTimer
}

// --------------------- Tracker Entries ---------------------
export type GetTrackerEntriesArgs = {
  from: Date
  to: Date
  projectId: string
}

const getTrackerEntries = async (args: GetTrackerEntriesArgs) => {
  const midday = getMiddayClient()

  const trackerEntries = await tryCatch(
    midday.trackerEntries.list({
      from: args.from.toISOString().split('T')[0],
      to: args.to.toISOString().split('T')[0],
      projectId: args.projectId,
    }),
  )

  return trackerEntries
}

export type CreateTrackerEntryArgs = NonNullable<
  Parameters<ReturnType<typeof getMiddayClient>['trackerEntries']['create']>[0]
>

const createTrackerEntry = async (args: Omit<CreateTrackerEntryArgs, 'dates' | 'assignedId' | 'duration'>) => {
  const midday = getMiddayClient()

  const createdTrackerEntry = await tryCatch(
    midday.trackerEntries.create({
      ...args,
      dates: [args.start.toISOString().split('T')[0]],
      duration: args.stop.getTime() / 1000 - args.start.getTime() / 1000,
    }),
  )

  return createdTrackerEntry
}

export const tracker = {
  timer: {
    getStatus: getTimerStatus,
    start: startTrackerTimer,
    stop: stopTrackerTimer,
  },
  projects: {
    get: getTrackerProjects,
  },
  entries: {
    get: getTrackerEntries,
    create: createTrackerEntry,
  },
}
