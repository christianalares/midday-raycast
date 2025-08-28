# Midday Raycast Extension

Access your [Midday](https://midday.ai) financial data directly from Raycast. View transactions, invoices, and account balances with secure OAuth authentication.

## Features

- 🔐 **Secure OAuth**: PKCE-based OAuth 2.0 flow with Midday
- 📊 **Transaction History**: Browse and search your transactions
- 🧾 **Invoice Management**: View invoice status and details
- ⚡ **TypeScript**: Full TypeScript support with proper typing
- 🎯 **Raycast Native**: Built with Raycast's official utilities

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Midday OAuth Application

1. Go to [Midday Developer Console](https://midday.ai/developers)
2. Create a new OAuth application with these settings:
   - **Application Name**: `Midday Raycast Extension`
   - **Redirect URI**: `https://raycast.com/redirect?packageName=midday-raycast`
   - **Scopes**: `transactions.read invoices.read`
   - **Grant Type**: Authorization Code with PKCE

### 3. Configure Extension

1. Copy your **Client ID** from the Midday developer console
2. Open Raycast preferences → find "Midday" extension
3. Paste your **Midday Client ID** in the preferences

### 4. Development

```bash
npm run dev
```

## OAuth Configuration Details

### Raycast OAuth Flow

This extension uses **Raycast's OAuth utilities** with **Midday's OAuth endpoints**:

1. **Secure PKCE Flow** - Uses Proof Key for Code Exchange for security
2. **Raycast Integration** - Native OAuth overlay and token management
3. **Automatic Redirects** - Handled seamlessly by Raycast
4. **Token Storage** - Secure token storage with automatic logout preference

### OAuth Endpoints

- **Authorization URL**: `https://api.midday.ai/oauth/authorize`
- **Token URL**: `https://api.midday.ai/oauth/token`
- **Scopes**: `transactions.read invoices.read`
- **Flow**: Authorization Code with PKCE

### Redirect URI

**Use this exact redirect URI in your Midday OAuth app:**

```
https://raycast.com/redirect?packageName=midday-raycast
```

This is Raycast's standard OAuth redirect - no custom backend needed!

## Commands

- **Dashboard**: Main authentication and overview
- **Transactions**: Browse and search transaction history
- **Invoices**: View invoice status and details (coming soon)

## File Structure

```
├── src/
│   ├── main.tsx          # Dashboard & OAuth setup
│   ├── transactions.tsx  # Transaction list view
│   └── types.ts          # TypeScript interfaces
├── assets/
│   └── command-icon.png  # Extension icon
├── package.json          # Extension manifest
├── tsconfig.json         # TypeScript config
└── raycast-env.d.ts      # Generated types
```

## Integration with Midday SDK

This extension uses the official [Midday TypeScript SDK](https://github.com/midday-ai/midday-ts):

```typescript
import { Midday } from '@midday-ai/sdk'

const midday = new Midday({
  security: {
    oauth2: accessToken, // From extension preferences
  },
})

// Use the SDK to fetch data
const bankAccounts = await midday.bankAccounts.list()
const invoices = await midday.invoices.list()
const metrics = await midday.metrics.revenue({
  from: '2024-01-01',
  to: '2024-12-31',
  currency: 'USD',
})
```

## Development

1. **Start Development**: `npm run dev`
2. **Open Raycast**: The extension appears in development mode
3. **Authenticate**: Follow the OAuth flow to connect your Midday account
4. **Test Features**: Try different commands and API calls

## Built With

- [Raycast API](https://developers.raycast.com/)
- [Raycast OAuth Utils](https://developers.raycast.com/utilities/oauth)
- [Midday TypeScript SDK](https://github.com/midday-ai/midday-ts)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run dev`
5. Submit a pull request

## License

MIT License - feel free to use this as a template for your own Raycast extensions!

---

**Note**: This extension requires a Midday account and OAuth application. Visit [midday.ai](https://midday.ai) to get started with Midday's financial management platform.
