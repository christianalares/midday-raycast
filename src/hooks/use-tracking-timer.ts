import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { clearCurrentInterval, getCurrentInterval, setCurrentInterval } from '../lib/interval'

export const useTrackingTimer = () => {
  const [intervalState, setIntervalState] = useState(getCurrentInterval())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const getTimerStatusMutation = useMutation({
    mutationFn: api.getTimerStatus,
  })

  useEffect(() => {
    getTimerStatusMutation.mutate(undefined, {
      onSuccess: ({ data }) => {
        if (data.isRunning) {
          setIntervalState(data.elapsedTime)
          setCurrentInterval(data.elapsedTime)

          intervalRef.current = setInterval(() => {
            setCurrentInterval((getCurrentInterval() ?? 0) + 1)
            setIntervalState((prev) => (prev ?? 0) + 1)
          }, 1000)
        } else {
          clearCurrentInterval()
          setIntervalState(undefined)

          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
        }
      },
    })
  }, [])

  const get = useCallback(() => {
    return getCurrentInterval()
  }, [])

  return {
    getFromCache: get,
    getFromApi: getTimerStatusMutation.mutate,
    fromState: intervalState,
  }

  // const { data: timerStatusData, isLoading: isLoadingTimerStatus } = useQuery({
  //   ...queryKeys.trackerTimer.status()
  // })
}
