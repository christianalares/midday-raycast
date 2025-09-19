import { tryCatch } from '../lib/utils'
import { getMiddayClient } from './oauth'

export type GetTransactionsArgs = NonNullable<Parameters<ReturnType<typeof getMiddayClient>['transactions']['list']>[0]>

const getTransactions = async (args: GetTransactionsArgs) => {
  const midday = getMiddayClient()

  const transactions = await tryCatch(
    midday.transactions.list({
      ...args,
    }),
  )

  return transactions.data
}

const getTransactionById = async (id: string) => {
  console.log('🔍 Getting transaction by id', id)
  const midday = getMiddayClient()

  const transaction = await tryCatch(midday.transactions.get({ id }))

  return transaction
}

export type GetPreSignedTransactionAttachmentUrlArgs = NonNullable<
  Parameters<ReturnType<typeof getMiddayClient>['transactions']['getAttachmentPreSignedUrl']>[0]
>

const getPreSignedTransactionAttachmentUrl = async (
  args: Omit<GetPreSignedTransactionAttachmentUrlArgs, 'download'>,
) => {
  const midday = getMiddayClient()

  const preSignedTransactionAttachmentUrl = await tryCatch(
    midday.transactions.getAttachmentPreSignedUrl({
      ...args,
      download: false,
    }),
  )

  return preSignedTransactionAttachmentUrl
}

export const transactions = {
  get: getTransactions,
  getById: getTransactionById,
  getPreSignedAttachmentUrl: getPreSignedTransactionAttachmentUrl,
}
