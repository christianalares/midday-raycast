import { tryCatch } from '../lib/utils'
import { getMiddayClient } from './oauth'

export type GetDocumentsArgs = NonNullable<Parameters<ReturnType<typeof getMiddayClient>['documents']['list']>[0]>

const getDocuments = async (args: GetDocumentsArgs) => {
  const midday = getMiddayClient()

  const documents = await tryCatch(midday.documents.list(args))

  return documents
}

const getDocumentById = async (id: string) => {
  const midday = getMiddayClient()

  const document = await tryCatch(midday.documents.get({ id }))

  return document
}

export const documents = {
  get: getDocuments,
  getById: getDocumentById,
}
