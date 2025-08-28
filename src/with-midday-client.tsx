import { withAccessToken } from '@raycast/utils'
import React from 'react'
import { middayOAuth } from './api/oauth'

export function withMiddayClient<T>(Component: React.ComponentType<T>) {
  return withAccessToken(middayOAuth)(Component)
}
