import { Action, ActionPanel, Icon, List, open } from '@raycast/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys } from './api/queries'
import { withMiddayClient } from './lib/with-midday-client'
import { downloadFileToTempDir, savePdf } from './lib/utils'
import { api } from './api'

type Props = {
  transactionId: string
}

const TransactionAttatchments = ({ transactionId }: Props) => {
  const { data: transaction, isLoading } = useQuery(queryKeys.transactions.getById(transactionId))

  const downloadFileToTempDirMutation = useMutation({
    mutationFn: downloadFileToTempDir,
    meta: {
      toastTitle: {
        loading: 'Downloading attachment...',
        success: '✅ Attachment downloaded',
        error: '❌ Failed to download attachment',
      },
    },
    onSuccess: (data) => {
      console.log('downloadFileToTempDir - DATA', data)
    },
  })

  const getPreSignedTransactionAttachmentUrlMutation = useMutation({
    mutationFn: api.getPreSignedTransactionAttachmentUrl,
    meta: {
      toastTitle: {
        loading: 'Getting pre-signed attachment URL...',
        success: '✅ Pre-signed attachment URL received',
        error: '❌ Failed to get pre-signed attachment URL',
      },
    },
    onSuccess: (data) => {
      console.log('api.getPreSignedTransactionAttachmentUrl - DATA', data)
    },
  })

  const isDownloading =
    downloadFileToTempDirMutation.isPending || getPreSignedTransactionAttachmentUrlMutation.isPending

  if (!transaction) {
    return null
  }

  const attachments = transaction.attachments ?? []

  return (
    <List
      isLoading={isLoading || isDownloading}
      searchBarPlaceholder="Search attachments"
      // onSelectionChange={setSelectedAttachmentId}
    >
      {attachments.map((attachment) => (
        <List.Item
          id={attachment.id}
          key={attachment.id}
          title={attachment.filename ?? attachment.path.at(-1) ?? attachment.id}
          actions={
            <ActionPanel>
              <Action
                title="View Attachment"
                icon={Icon.Eye}
                onAction={async () => {
                  getPreSignedTransactionAttachmentUrlMutation.mutate(
                    {
                      transactionId,
                      attachmentId: attachment.id,
                    },
                    {
                      onSuccess: (preSignedData) => {
                        downloadFileToTempDirMutation.mutate(
                          {
                            url: preSignedData.url,
                            fileName: preSignedData.fileName ?? `${Date.now().toString()}.pdf`,
                          },
                          {
                            onSuccess: (downloadedData) => {
                              open(downloadedData.path)
                            },
                          },
                        )
                      },
                    },
                  )
                }}
              />
              <Action
                title="Save Attachment"
                icon={Icon.Download}
                onAction={() => {
                  getPreSignedTransactionAttachmentUrlMutation.mutate(
                    {
                      transactionId,
                      attachmentId: attachment.id,
                    },
                    {
                      onSuccess: (preSignedData) => {
                        savePdf({
                          url: preSignedData.url,
                          fileName: preSignedData.fileName ?? `${Date.now().toString()}.pdf`,
                        })
                      },
                    },
                  )
                }}
              />
              {/* <Action.OpenInBrowser title="Download Attachment" icon={Icon.Download} url={attatchmentData.url} /> */}
              {/* <Action.CopyToClipboard
                  title="Copy Attachment URL"
                  icon={Icon.Clipboard}
                  content={attatchmentData.url}
                /> */}
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}

export default withMiddayClient(TransactionAttatchments)
