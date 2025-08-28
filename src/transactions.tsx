import { Detail } from '@raycast/api'

import { withMiddayClient } from './with-midday-client'

function TransactionsComponent() {
  const markdown = `# 🎉 Connected to Midday!

**Status**: ✅ OAuth Authentication Successful  
**Provider**: Midday API  

## Available Commands

Your Midday Raycast extension is ready! Available commands:

### 📊 **Transactions**
View and search your transaction history

### 🧾 **Invoices** 
Manage invoices and track payment status

### 💰 **Financial Metrics**
View revenue, spending, and cash flow insights

### 🏦 **Bank Accounts**
Monitor account balances and details

Ready to manage your finances! 🚀`

  return <Detail markdown={markdown} />
}

export default withMiddayClient(TransactionsComponent)
