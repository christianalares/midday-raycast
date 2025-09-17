import { Action, ActionPanel, Color, Detail, Icon, List } from '@raycast/api'
import { withMiddayClient } from './lib/with-midday-client'
import { queryKeys } from './api/queries'
import { useMutation, useQuery } from '@tanstack/react-query'
import { formatCurrency } from './lib/utils'
import { api } from './api'
import { useState } from 'react'

type Props = {
  transactionId: string
}

const TransactionAttatchments = ({ transactionId }: Props) => {
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null)

  console.log('selectedAttachmentId', selectedAttachmentId)

  const { data: transaction, isLoading } = useQuery(queryKeys.transactions.getById(transactionId))

  const { data: attatchment, isLoading: isLoadingAttachment } = useQuery({
    ...queryKeys.transactions.getAttachmentPreSignedUrl({
      // Empty string is just for type safety, the query will be disabled if selectedAttachmentId is null
      transactionId,
      attachmentId: selectedAttachmentId ?? '',
    }),
    enabled: !!selectedAttachmentId,
  })

  // const getPreSignedTransactionAttachmentUrlMutation = useMutation({
  //   mutationFn: api.getPreSignedTransactionAttachmentUrl,
  // })

  if (!transaction) {
    return null
  }

  const attachments = transaction.attachments ?? []

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search attachments" onSelectionChange={setSelectedAttachmentId}>
      {attachments.map((attachment) => (
        <List.Item
          id={attachment.id}
          key={attachment.id}
          title={attachment.filename ?? attachment.path.at(-1) ?? attachment.id}
          // quickLook={
          //   attatchment
          //     ? {
          //         path: attatchment.url.replace('&download=', ''),
          //         name: attachment.filename,
          //       }
          //     : undefined
          // }
          actions={
            attatchment && (
              <ActionPanel>
                <Action.OpenInBrowser
                  title="View Attachment"
                  icon={Icon.Eye}
                  url={attatchment.url.replace('&download=', '')}
                />
                <Action.OpenInBrowser title="Download Attachment" icon={Icon.Download} url={attatchment.url} />
                <Action.CopyToClipboard title="Copy Attachment URL" icon={Icon.Clipboard} content={attatchment.url} />
              </ActionPanel>
            )
            // attatchment ? (
            //   <ActionPanel>
            //     <Action.ToggleQuickLook title="Preview Attachment" icon={Icon.Eye} />
            //   </ActionPanel>
            // ) : undefined
          }
        />
      ))}
    </List>
  )
}

export default withMiddayClient(TransactionAttatchments)
