import { captureException, launchCommand, LaunchType, type Form } from '@raycast/api'
import { runAppleScript } from '@raycast/utils'
import { formatDuration } from 'date-fns'
import { promises as fs } from 'fs'
import { countries } from './countries'

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export const cleanFormProps = <T extends Form.ItemProps<any>>(props: T) => {
  return {
    ...props,
    value: props.value === null ? undefined : props.value,
    defaultValue: props.defaultValue === null ? undefined : props.defaultValue,
  }
}

/**
 * Wraps a promise with consistent error handling:
 * - Logs errors for debugging
 * - Captures errors for monitoring
 * - Re-throws errors for proper TanStack Query integration
 */
export const tryCatch = async <T>(promise: Promise<T>): Promise<T> => {
  try {
    return await promise
  } catch (err) {
    console.error(err)
    captureException(err)
    throw err
  }
}

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export const formatDurationFromSeconds = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  const formattedDuration = formatDuration(
    {
      hours,
      minutes,
    },
    {
      format: ['hours', 'minutes'],
      delimiter: ', ',
    },
  )

  return formattedDuration
}

export const formatTimerDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const formattedHours = hours.toString().padStart(2, '0')
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = seconds.toString().padStart(2, '0')

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
}

export const getCountryByCode = (code: string) => {
  const foundCountry = Object.values(countries).find((country) => country.code === code)

  if (foundCountry) {
    return foundCountry
  }

  return null
}

export const formatSize = (bytes: number) => {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte']

  const unitIndex = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1))

  return Intl.NumberFormat(undefined, {
    style: 'unit',
    unit: units[unitIndex],
  }).format(+Math.round(bytes / 1024 ** unitIndex))
}

export const promptForPath = async (defaultFileName: string) => {
  const filePath = await runAppleScript(
    `
    set defaultFile to choose file name with prompt "Save attachment as:" default name "${defaultFileName}"
    return POSIX path of defaultFile
  `,
    {
      timeout: 30000,
    },
  )

  return filePath.trim()
}

export const downloadFile = async ({ url, path: filePath }: { url: string; path: string }) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  await fs.writeFile(filePath, Buffer.from(buffer))

  return { path: filePath }
}

export const quickLookFile = async (path: string) => {
  await runAppleScript(`
    try
      do shell script "qlmanage -p " & quoted form of "${path}"
    on error
      -- Fallback: reveal in Finder if Quick Look fails
      tell application "Finder"
        reveal POSIX file "${path}" as alias
        activate
      end tell
    end try
  `)
}

export const refreshMenuBar = () => {
  launchCommand({
    name: 'menu-bar',
    type: LaunchType.Background,
  })
}

export const getWebsiteLogo = (website: string) => {
  return `https://img.logo.dev/${website}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ&size=180&retina=true`
}

// type A = QueryResults['customers']['list'][number]

export const getCustomerWebsite = (customer: { website: string | null; name: string }) => {
  if (!customer.website || customer.website.trim() === '') {
    // This constructs a website format based on the customer name
    // which will generate a logo with the letter of the customer name
    return getWebsiteLogo(`${customer.name.replace(/ /g, '').toLowerCase()}.com`)
  }

  return getWebsiteLogo(customer.website)
}
