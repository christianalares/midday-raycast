import { Action, ActionPanel, captureException, Icon, List, showInFinder } from '@raycast/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import os from 'os'
import path from 'path'
import { api } from './api'
import { queryKeys } from './api/queries'
import { downloadFile, formatSize, promptForPath, quickLookFile } from './lib/utils'
import { withMiddayClient } from './lib/with-midday-client'

const getIconByMimeType = (mimeType: string) => {
  if (mimeType.startsWith('image/')) {
    return Icon.Image
  }

  if (mimeType === 'application/pdf') {
    return Icon.Document
  }

  return Icon.Document
}

type Props = {
  transactionId: string
}

const TransactionAttatchments = ({ transactionId }: Props) => {
  const { data: transaction, isLoading } = useQuery(queryKeys.transactions.getById(transactionId))

  const downloadFileMutation = useMutation({
    mutationFn: downloadFile,
    meta: {
      toastTitle: {
        loading: 'Downloading attachment...',
        success: '✅ Attachment downloaded',
        error: '❌ Failed to download attachment',
      },
    },
  })

  const getPreSignedTransactionAttachmentUrlMutation = useMutation({
    mutationFn: api.transactions.getPreSignedAttachmentUrl,
    meta: {
      toastTitle: {
        loading: 'Getting attachment URL...',
        success: '✅ Attachment URL received',
        error: '❌ Failed to get attachment URL',
      },
    },
  })

  const isDownloading = downloadFileMutation.isPending || getPreSignedTransactionAttachmentUrlMutation.isPending

  if (!transaction) {
    return null
  }

  const attachments = transaction.attachments ?? []

  return (
    <List isLoading={isLoading || isDownloading} searchBarPlaceholder="Search attachments">
      {attachments.map((attachment) => (
        <List.Item
          id={attachment.id}
          key={attachment.id}
          title={attachment.filename ?? attachment.path.at(-1) ?? attachment.id}
          icon={getIconByMimeType(attachment.type)}
          accessories={[
            {
              text: formatSize(attachment.size),
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Download Attachment"
                icon={Icon.Download}
                onAction={() => {
                  getPreSignedTransactionAttachmentUrlMutation.mutate(
                    {
                      transactionId,
                      attachmentId: attachment.id,
                    },
                    {
                      onSuccess: async (preSignedData) => {
                        try {
                          const fileName = preSignedData.fileName ?? `${Date.now().toString()}.pdf`
                          const filePath = await promptForPath(fileName)

                          const { path: downloadedPath } = await downloadFile({
                            url: preSignedData.url,
                            path: filePath,
                          })

                          showInFinder(downloadedPath)
                        } catch (error) {
                          console.error('Failed to download attachment:', error)
                          captureException(error)
                        }
                      },
                    },
                  )
                }}
              />

              <Action
                title="Preview Attachment"
                shortcut={{ modifiers: ['cmd'], key: 'y' }}
                icon={Icon.Eye}
                onAction={async () => {
                  getPreSignedTransactionAttachmentUrlMutation.mutate(
                    {
                      transactionId,
                      attachmentId: attachment.id,
                    },
                    {
                      onSuccess: (preSignedData) => {
                        const tempFileName = `${new Date().toISOString()}__${preSignedData.fileName ?? `${Date.now().toString()}.pdf`}`
                        const tempPath = path.join(os.tmpdir(), tempFileName)

                        downloadFileMutation.mutate(
                          {
                            url: preSignedData.url,
                            path: tempPath,
                          },
                          {
                            onSuccess: async (downloadedData) => {
                              await quickLookFile(downloadedData.path)
                            },
                          },
                        )
                      },
                    },
                  )
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}

export default withMiddayClient(TransactionAttatchments)
