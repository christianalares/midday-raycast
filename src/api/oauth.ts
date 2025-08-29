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
  scope: 'apis.all',
  authorizeUrl:
    'https://oauth.raycast.com/v1/authorize/r53Ekwg57FYCh8iLGOc9MBxVFvVmntETGo4KUZDJ491b310MjV9KEAF47F8I_soC4dmys6UCAHKxq6XOWMBeI39Wf6cm6-Y5dCpYSGqUTSXcbnwc6CR8pREjcLR_Q76vZnTDfCDbBjGROx64s-ME85Uz',
  tokenUrl:
    'https://oauth.raycast.com/v1/token/0kK9tWDNMe4zoRZAXjhvg1GmDIJ7r6RUl1v44W1DcyGDWRxYIWn15bSkXt6dzPUvk595OBfNXf13SDXNbqedWQy2uVZptuHdR7ZoDnzvLIfVTdjnloGvEhqLf-CKuMPF7865cptY65Nmnr-Da1M',
  refreshTokenUrl:
    'https://oauth.raycast.com/v1/refresh-token/itxZG4UwXhufOr284n5bMRk1lGN1s1ka8lxQpu2Oi6BR6kA6attrMPrPyKsXrhvsb_FpPJUvP7TJSjz5GEOYtyM7o-mI_cLGw9PyDvBTfk1CCdrfEbpVCUXEGScx-AOY0bB_kn_4wCqwbyRBOjE',
  // authorizeUrl: 'https://app.midday.ai/oauth/authorize',
  // tokenUrl: 'https://api.midday.ai/oauth/token',
  // refreshTokenUrl: 'https://api.midday.ai/oauth/token',
  bodyEncoding: 'json',
  onAuthorize({ token }) {
    midday = new Midday({
      security: {
        // oauth2: token,
        token,
      },
    })
  },
})

export function getMiddayClient() {
  // return {
  //   getTransactions: async () => {
  //     return []
  //   },
  // }
  if (!midday) {
    throw new Error('No Midday client initialized. Please connect your Midday account.')
  }

  return midday
}
