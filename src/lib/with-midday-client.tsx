import { withAccessToken } from "@raycast/utils";
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { middayOAuth } from "../api/oauth";
import { getQueryClient } from "./query-client";

export function withMiddayClient<T extends Record<string, any>>(Component: React.ComponentType<T>) {
  return withAccessToken(middayOAuth)((props: T) => {
    const queryClient = getQueryClient();

    return (
      <QueryClientProvider client={queryClient}>
        <Component {...props} />
      </QueryClientProvider>
    );
  });
}
