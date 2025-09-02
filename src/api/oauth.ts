import { OAuth } from "@raycast/api";
import { OAuthService } from "@raycast/utils";
import { Midday } from "@midday-ai/sdk";

let midday: Midday | null = null;
let globalToken = "";

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Midday",
  providerIcon: "command-icon.png",
  providerId: "midday",
  description: "Connect your Midday account",
});

export const middayOAuth = new OAuthService({
  client,
  clientId: "mid_client_ae0Ldc62GX117eirIjIZnqVD",
  scope: "apis.all",
  authorizeUrl: "https://app.midday.ai/oauth/authorize",
  tokenUrl: "https://api.midday.ai/oauth/token",
  refreshTokenUrl: "https://api.midday.ai/oauth/token",
  bodyEncoding: "json",
  onAuthorize({ token }) {
    globalToken = token;
    midday = new Midday({
      security: {
        token,
      },
    });
  },
});

export function getGlobalToken() {
  return globalToken;
}

export function getMiddayClient() {
  if (!midday) {
    throw new Error("No Midday client initialized. Please connect your Midday account.");
  }

  return midday;
}
