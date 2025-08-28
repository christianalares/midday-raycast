import { OAuth } from '@raycast/api'
import { OAuthService } from '@raycast/utils'
import { Midday } from '@midday-ai/sdk'

let midday: Midday | null = null

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: 'Midday',
  providerIcon: 'command-icon.png',
  providerId: 'midday',
  description: 'Connect your Midday account',
})

export const middayOAuth = new OAuthService({
  client,
  clientId: 'mid_client_ae0Ldc62GX117eirIjIZnqVD',
  scope: ['transactions.read', 'invoices.read'].join(' '),
  authorizeUrl: 'https://api.midday.ai/oauth/authorize',
  tokenUrl: 'https://api.midday.ai/oauth/token',
  refreshTokenUrl: 'https://api.midday.ai/oauth/token',
  bodyEncoding: 'url-encoded',
  onAuthorize({ token }) {
    midday = new Midday({
      security: {
        oauth2: token,
      },
    })
  },
})

export function getMiddayClient() {
  if (!midday) {
    throw new Error('No Dub client initialized. Please connect your Dub account.')
  }

  return midday
}
