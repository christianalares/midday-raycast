import "@tanstack/react-query";

// Augment TanStack Query's Register interface to add type safety for meta
declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      toastTitle?: {
        loading?: string;
        success?: string;
        error?: string;
      };
    };
  }
}
