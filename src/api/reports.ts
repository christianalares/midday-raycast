import { tryCatch } from '../lib/utils'
import { getMiddayClient } from './oauth'

export const getSpendings = async ({ from, to }: { from: Date; to: Date }) => {
  const midday = getMiddayClient()

  const spendings = await tryCatch(
    midday.reports.spending({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    }),
  )

  return spendings
}

export const reports = {
  getSpendings,
}
