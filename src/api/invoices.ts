import { tryCatch } from '../lib/utils'
import { getMiddayClient } from './oauth'

export type GetInvoicesArgs = NonNullable<Parameters<ReturnType<typeof getMiddayClient>['invoices']['list']>[0]>

const getInvoices = async (args: GetInvoicesArgs) => {
  const midday = getMiddayClient()

  const invoices = await tryCatch(midday.invoices.list(args))

  return invoices.data
}

const getInvoiceById = async (id: string) => {
  const midday = getMiddayClient()

  const invoice = await tryCatch(midday.invoices.get({ id }))

  return invoice
}

export const invoices = {
  list: getInvoices,
  getById: getInvoiceById,
}
