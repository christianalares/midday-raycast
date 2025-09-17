import { formatDuration } from 'date-fns'
import { countries } from './countries'
import { showHUD, type Form } from '@raycast/api'
import { tmpdir } from 'os'
import path from 'path'
import { promises as fs } from 'fs'
import { runAppleScript } from '@raycast/utils'

export const cleanFormProps = <T extends Form.ItemProps<any>>(props: T) => {
  return {
    ...props,
    value: props.value === null ? undefined : props.value,
    defaultValue: props.defaultValue === null ? undefined : props.defaultValue,
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

export const downloadFileToTempDir = async ({ url, fileName }: { url: string; fileName: string }) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()

  const tempDir = tmpdir()

  const tempFileName = `${new Date().toISOString()}__${fileName}`
  const tempPath = path.join(tempDir, tempFileName)

  await fs.writeFile(tempPath, Buffer.from(buffer))

  return { path: tempPath, fileName: tempFileName }
}

export const savePdf = async ({ url, fileName }: { url: string; fileName: string }) => {
  try {
    await showHUD('Please select a location to save the image...')

    await runAppleScript(`
      set outputFolder to choose folder with prompt "Please select an output folder:"
      set temp_folder to (POSIX path of outputFolder) & "${fileName}.pdf"
      set q_temp_folder to quoted form of temp_folder

      set cmd to "curl -o " & q_temp_folder & " " & "${url}"
        do shell script cmd
    `)
  } catch (err) {
    console.error(err)
    await showHUD("Couldn't save the image...")
  }
}
